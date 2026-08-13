# Ôn luyện & Thi thử BTCB 2026

Website ôn luyện và thi thử trắc nghiệm, xây dựng bằng **Next.js 14 (App Router)** +
**Supabase** (đăng nhập, cơ sở dữ liệu), triển khai trên **Vercel**.

## Tính năng

- **Đăng ký / Đăng nhập** bằng email + mật khẩu (Supabase Auth).
- **Ôn luyện**: câu hỏi được chia thành các bộ 50 câu (1-50, 51-100, ...), mỗi bộ làm
  trong 30 phút (có thể đổi ở trang Cấu hình). Đáp án của mỗi câu được xáo trộn lại mỗi
  lần làm. Khi bấm chọn 1 đáp án, hệ thống báo **đúng/sai ngay lập tức**: khung xanh cho
  đáp án đúng, khung đỏ cho đáp án bạn chọn sai (đồng thời khung xanh vẫn hiện ở đáp án
  đúng).
- **Thi thật**: bốc ngẫu nhiên 1 bộ đề từ toàn bộ ngân hàng câu hỏi, đáp án xáo trộn,
  làm trong 30 phút. Có thể giới hạn số câu hỏi dùng cùng một "nguồn / hướng dẫn" trong 1
  đề (cấu hình ở trang Quản trị). Đáp án đúng **chỉ hiện sau khi nộp bài**, chấm điểm ở
  phía server để tránh gian lận. Tải lại trang giữa chừng sẽ không mất bài (hệ thống tự
  tiếp tục đúng lượt thi + thời gian còn lại).
- **Bảng xếp hạng**: điểm cao nhất của mỗi người trong các lượt thi thật đã nộp.
- **Trang quản trị** (chỉ tài khoản có role `admin`):
  - Nhập câu hỏi hàng loạt từ file Excel (.xlsx).
  - Thêm / sửa / xoá từng câu hỏi.
  - Cấu hình: số câu mỗi bộ ôn luyện, số câu mỗi đề thi thật, thời gian làm bài, điểm
    đạt, giới hạn số câu theo nguồn.

## Công nghệ

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres (cơ sở dữ liệu) + Auth (đăng nhập) + Row Level Security
- Thư viện `xlsx` (SheetJS) để đọc file Excel ngay trên trình duyệt
- Triển khai trên Vercel

---

## 1. Tạo dự án Supabase

1. Vào https://supabase.com → **New project**. Ghi nhớ mật khẩu database bạn đặt.
2. Sau khi project khởi tạo xong, vào **SQL Editor** → **New query**, dán toàn bộ nội
   dung file [`supabase/schema.sql`](./supabase/schema.sql) vào và bấm **Run**. Lệnh này
   tạo đầy đủ bảng, chính sách bảo mật (RLS) và trigger cần thiết.
3. Vào **Project Settings → API**, lấy 3 giá trị sau (sẽ dùng ở bước 3):
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ giữ bí mật, không lộ ra frontend)
4. (Tuỳ chọn) Vào **Authentication → Providers → Email**, nếu muốn tắt yêu cầu xác nhận
   email khi đăng ký (cho phép đăng nhập ngay sau khi đăng ký), tắt **Confirm email**.

## 2. Chạy thử ở máy local

```bash
npm install
cp .env.example .env.local
# Mở .env.local và điền 3 giá trị đã lấy ở bước 1.3
npm run dev
```

Mở http://localhost:3000, bấm **Đăng ký** để tạo tài khoản đầu tiên.

### Cấp quyền admin cho tài khoản đầu tiên

Vào Supabase Dashboard → **SQL Editor**, chạy:

```sql
update public.profiles set role = 'admin' where email = 'email-cua-ban@gmail.com';
```

Đăng xuất rồi đăng nhập lại trên website — menu **Quản trị** sẽ xuất hiện.

## 3. Nhập câu hỏi

Vào **Quản trị → Nhập từ Excel**. Tải file mẫu tại
[`excel-template/mau-cau-hoi.xlsx`](./excel-template/mau-cau-hoi.xlsx) để xem đúng định
dạng cột cần có:

| Câu hỏi | Đáp án 1 | Đáp án 2 | ... | Đáp án 6 | Đáp án đúng | Nguồn / Hướng dẫn |
|---|---|---|---|---|---|---|
| Nội dung câu hỏi | Đáp án A | Đáp án B | ... | (để trống nếu không dùng) | Số thứ tự đáp án đúng, vd `2` | Không bắt buộc |

- Mỗi câu có thể có **2 đến 6 đáp án** — chỉ cần điền vào các cột `Đáp án 1`..`Đáp án
  6` cần dùng, để trống các cột còn lại.
- Cột **Đáp án đúng** ghi **số thứ tự cột** của đáp án đúng (vd ghi `2` nghĩa là nội
  dung ở cột "Đáp án 2" là đáp án đúng).
- Cột **Nguồn / Hướng dẫn** không bắt buộc — nếu điền, hệ thống sẽ giới hạn số câu cùng
  nguồn trong 1 đề thi thật (bật/tắt và chỉnh số lượng ở **Quản trị → Cấu hình đề thi**,
  mục "Giới hạn số câu / nguồn").

Sau khi chọn file, trang sẽ hiện bảng xem trước (preview), báo dòng nào hợp lệ / lỗi
trước khi bạn bấm **Nhập vào ngân hàng đề**.

Bạn cũng có thể thêm/sửa từng câu tại **Quản trị → Ngân hàng câu hỏi**.

## 4. Triển khai lên Vercel

1. Đẩy code lên GitHub (tạo repo mới, `git init` nếu cần, `git push`).
2. Vào https://vercel.com → **Add New → Project** → chọn repo vừa đẩy lên.
3. Ở bước cấu hình, thêm 3 biến môi trường (mục **Environment Variables**), giống hệt
   trong `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Bấm **Deploy**. Sau khi xong, Vercel cấp cho bạn 1 tên miền dạng
   `ten-du-an.vercel.app`.
5. Vào Supabase Dashboard → **Authentication → URL Configuration**, thêm domain Vercel
   vào **Site URL** và **Redirect URLs** để đăng nhập/đăng ký hoạt động đúng trên domain
   thật.

Mỗi lần bạn `git push` lên nhánh chính, Vercel sẽ tự động build & deploy lại.

---

## Cấu trúc thư mục

```
src/
  app/                 Các trang (App Router) + API routes (src/app/api/**)
  components/          Component dùng chung (Timer, ProgressMap, QuestionForm, ...)
  lib/
    supabase/          3 kiểu Supabase client: browser / server (theo cookie người dùng)
                        / admin (service role, chỉ dùng trong API routes)
    types.ts           Kiểu dữ liệu dùng chung
    examSelect.ts       Thuật toán bốc đề thi thật (random + giới hạn theo nguồn)
    examServer.ts       Hàm dùng chung cho các API route thi thật (chấm điểm, ...)
  middleware.ts         Bảo vệ các route cần đăng nhập, làm mới phiên đăng nhập
supabase/
  schema.sql            Toàn bộ schema + RLS cần chạy trên Supabase
excel-template/
  mau-cau-hoi.xlsx      File Excel mẫu để nhập câu hỏi
```

## Kiến trúc bảo mật (tóm tắt)

- Bảng `questions` (chứa đáp án đúng) **chỉ tài khoản admin** đọc/ghi trực tiếp được
  (Row Level Security). Người dùng thường lấy câu hỏi qua các API route ở server:
  - **Ôn luyện** (`/api/practice/questions`): trả về kèm đáp án đúng (vì cần hiện ngay
    khi bấm chọn).
  - **Thi thật** (`/api/exam/start`, `/api/exam/submit`): khi đang làm bài, KHÔNG trả
    đáp án đúng về trình duyệt; chấm điểm diễn ra ở server (`/api/exam/submit`) dựa trên
    dữ liệu gốc trong database, không tin điểm số do client gửi lên.
- Bảng `exam_attempts` (lượt thi): người dùng chỉ có thể tự ghi nhận lượt **ôn luyện**
  (không quan trọng vì đáp án đã lộ sẵn). Lượt **thi thật** chỉ được tạo/cập nhật thông
  qua API route dùng `service_role` key ở server — người dùng không thể tự sửa điểm số
  của mình.
- **Giới hạn đã biết**: vì đây là ứng dụng ôn thi nội bộ (không phải kỳ thi có giám sát
  chặt), một người dùng có kỹ thuật vẫn có thể tra cứu đáp án đúng của 1 câu hỏi cụ thể
  thông qua trang **Ôn luyện** (API `/api/practice/questions` luôn trả kèm đáp án) rồi
  đối chiếu sang bài thi thật. Đây là đánh đổi hợp lý cho một web ôn luyện nội bộ; nếu
  cần chống gian lận ở mức cao hơn, có thể cân nhắc thêm giới hạn tốc độ gọi API hoặc
  theo dõi hành vi bất thường.

## Đổi thương hiệu / giao diện

- Tên trang, màu sắc: sửa `src/app/layout.tsx` (metadata), `src/components/Navbar.tsx`,
  và bảng màu trong `tailwind.config.ts`.
- Toàn bộ giao diện dùng tiếng Việt, có thể sửa trực tiếp trong các file `.tsx` tương
  ứng.
