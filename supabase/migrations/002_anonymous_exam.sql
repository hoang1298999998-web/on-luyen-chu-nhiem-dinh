-- =============================================================
-- Migration: cho phép thi không cần đăng nhập (chỉ admin còn cần tài khoản).
-- Chạy 1 lần trong Supabase Dashboard > SQL Editor trên project ĐÃ chạy
-- schema.sql trước đó. An toàn để chạy lại nhiều lần.
-- =============================================================

alter table public.exam_attempts alter column user_id drop not null;
alter table public.exam_attempts add column if not exists display_name text;
alter table public.exam_attempts add column if not exists session_token text;

create index if not exists exam_attempts_session_token_idx on public.exam_attempts (session_token);

drop policy if exists "exam_attempts_select_own" on public.exam_attempts;
drop policy if exists "exam_attempts_insert_practice_own" on public.exam_attempts;
-- Từ giờ TẤT CẢ đọc/ghi exam_attempts đi qua API route phía server (service_role
-- key, bỏ qua RLS) -> không cần policy select/insert nào cho anon/authenticated nữa.
