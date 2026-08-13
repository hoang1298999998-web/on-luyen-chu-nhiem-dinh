-- =============================================================
-- BTCB 2026 - Web ôn luyện & thi thử trắc nghiệm
-- Supabase schema (Postgres)
-- Chạy toàn bộ file này trong: Supabase Dashboard > SQL Editor > New query > Run
-- An toàn để chạy lại (dùng "if not exists" / "or replace" ở hầu hết chỗ),
-- nhưng nếu chạy lại từ đầu trên DB đã có dữ liệu, hãy cân nhắc trước khi drop.
-- =============================================================

create extension if not exists "pgcrypto";

-- =============================================================
-- 1. PROFILES  (hồ sơ người dùng, tạo tự động khi đăng ký)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (auth.role() = 'authenticated'); -- cần đọc full_name của người khác để hiển thị bảng xếp hạng

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Tự động tạo hồ sơ khi có người dùng mới đăng ký qua Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- 2. QUESTIONS  (ngân hàng câu hỏi)
--    - options: jsonb dạng [{"id":"1","text":"..."}, {"id":"2","text":"..."}, ...] (2-6 đáp án)
--    - correct_option_id: khớp với "id" trong options của chính câu đó (vd "2")
--    - source: "Hướng dẫn / nguồn" (không bắt buộc) dùng để giới hạn số câu
--      cùng nguồn khi bốc đề thi thật ngẫu nhiên
--    Bảng này CHỈ admin mới đọc/ghi trực tiếp được (RLS).
--    Người dùng thường lấy câu hỏi qua các API route phía server
--    (ôn luyện: lộ đáp án ngay; thi thật: giấu đáp án tới khi nộp bài).
-- =============================================================
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  content text not null,
  options jsonb not null,
  correct_option_id text not null,
  source text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create unique index if not exists questions_order_index_key on public.questions (order_index);

alter table public.questions enable row level security;

drop policy if exists "questions_admin_all" on public.questions;
create policy "questions_admin_all"
  on public.questions for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =============================================================
-- 3. EXAM_CONFIG  (cấu hình đề thi / ôn luyện, 1 dòng duy nhất)
-- =============================================================
create table if not exists public.exam_config (
  id integer primary key default 1,
  practice_group_size integer not null default 50,
  practice_duration_minutes integer not null default 30,
  exam_question_count integer not null default 50,
  exam_duration_minutes integer not null default 30,
  pass_percentage integer not null default 80,
  max_per_source integer, -- null = không giới hạn theo nguồn
  updated_at timestamptz not null default now(),
  constraint exam_config_singleton check (id = 1)
);

insert into public.exam_config (id)
values (1)
on conflict (id) do nothing;

alter table public.exam_config enable row level security;

drop policy if exists "exam_config_select_authenticated" on public.exam_config;
create policy "exam_config_select_authenticated"
  on public.exam_config for select
  using (auth.role() = 'authenticated');

drop policy if exists "exam_config_admin_write" on public.exam_config;
create policy "exam_config_admin_write"
  on public.exam_config for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =============================================================
-- 4. EXAM_ATTEMPTS  (mỗi lượt ôn luyện / thi thật của 1 người dùng)
--    - mode: 'practice' | 'exam'
--    - question_ids: danh sách id câu hỏi thuộc lượt này, theo đúng thứ tự hiển thị
--    - option_order: jsonb {question_id: [option_id,...]} thứ tự đáp án đã xáo trộn
--    - answers: jsonb {question_id: option_id} câu trả lời của người dùng
--    Ghi/đọc lượt thi THẬT chỉ thực hiện qua API route phía server (service role),
--    KHÔNG cho phép insert/update trực tiếp từ client để tránh gian lận điểm số.
--    Lượt ôn luyện được phép tự ghi nhận (không quan trọng bảo mật vì đáp án đã lộ sẵn).
-- =============================================================
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('practice', 'exam')),
  group_no integer,
  question_ids uuid[] not null,
  option_order jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  correct_count integer,
  total_count integer not null,
  score numeric,
  duration_seconds integer not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired'))
);

create index if not exists exam_attempts_user_id_idx on public.exam_attempts (user_id);
create index if not exists exam_attempts_leaderboard_idx on public.exam_attempts (mode, status, score desc);

alter table public.exam_attempts enable row level security;

drop policy if exists "exam_attempts_select_own" on public.exam_attempts;
create policy "exam_attempts_select_own"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

-- Chỉ cho phép client tự ghi nhận lượt ÔN LUYỆN (không ảnh hưởng bảng xếp hạng)
drop policy if exists "exam_attempts_insert_practice_own" on public.exam_attempts;
create policy "exam_attempts_insert_practice_own"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id and mode = 'practice');

-- Lượt THI THẬT (mode='exam') chỉ được tạo/cập nhật bởi các API route dùng
-- service role key (bỏ qua RLS) -> không có policy insert/update cho mode='exam' ở đây.

-- =============================================================
-- 5. Cho phép admin xem toàn bộ exam_attempts (thống kê)
-- =============================================================
drop policy if exists "exam_attempts_admin_select_all" on public.exam_attempts;
create policy "exam_attempts_admin_select_all"
  on public.exam_attempts for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =============================================================
-- HOÀN TẤT.
-- Bước tiếp theo (làm thủ công trong Supabase Dashboard hoặc SQL Editor):
--   1) Đăng ký 1 tài khoản trên chính website sau khi deploy.
--   2) Chạy lệnh sau để cấp quyền admin cho tài khoản đó:
--        update public.profiles set role = 'admin' where email = 'ban@email.com';
-- =============================================================
