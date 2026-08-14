# Ôn luyện & Thi thử BTCB 2026

Website ôn luyện và thi thử trắc nghiệm, xây dựng bằng **Next.js 14 (App Router)**.
**Không có database, không cần đăng nhập, không cần cấu hình gì** — 135 câu hỏi mặc định
nằm sẵn trong code, triển khai thẳng lên **Vercel** là chạy được ngay.

## Tính năng

- **Ôn luyện**: 135 câu hỏi được chia thành các bộ 50 câu (1-50, 51-100, 101-135), mỗi bộ
  làm trong 30 phút. Đáp án của mỗi câu được xáo trộn lại mỗi lần làm. Khi bấm chọn 1 đáp
  án, hệ thống báo **đúng/sai ngay lập tức**: khung xanh cho đáp án đúng, khung đỏ cho
  đáp án bạn chọn sai.
- **Thi thử**: bốc ngẫu nhiên 50 câu từ toàn bộ ngân hàng câu hỏi (giới hạn tối đa 4 câu
  cùng một nguồn/quy định trong 1 đề), đáp án xáo trộn, làm trong 30 phút. Đáp án đúng
  **chỉ hiện sau khi nộp bài**. Tải lại trang giữa chừng sẽ không mất bài (lưu trong
  `localStorage` của trình duyệt).
- **Lịch sử làm bài**: lưu lại điểm số + toàn bộ bài làm (câu hỏi, đáp án đã chọn, đáp án
  đúng) của các lượt ôn luyện/thi thử **ngay trên trình duyệt** (không có server, không
  chia sẻ giữa nhiều người/nhiều máy).

## Công nghệ

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Không dùng database / không dùng server**: câu hỏi nhúng tĩnh trong
  [`src/data/questions.ts`](./src/data/questions.ts), lịch sử làm bài lưu trong
  `localStorage`. Toàn bộ trang chạy phía client sau khi tải về.
- Triển khai trên Vercel (không cần biến môi trường nào)

---

## 1. Chạy thử ở máy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## 2. Triển khai lên Vercel

1. Đẩy code lên GitHub (`git push`).
2. Vào https://vercel.com → **Add New → Project** → chọn repo vừa đẩy lên.
3. Bấm **Deploy** — không cần thêm biến môi trường nào cả.

Mỗi lần bạn `git push` lên nhánh chính, Vercel sẽ tự động build & deploy lại.

## 3. Đổi / thêm câu hỏi

Sửa trực tiếp mảng `QUESTIONS` trong
[`src/data/questions.ts`](./src/data/questions.ts). Mỗi câu hỏi có dạng:

```ts
{
  id: "q1",
  content: "Nội dung câu hỏi...",
  options: [
    { id: "1", text: "A: ..." },
    { id: "2", text: "B: ..." },
    { id: "3", text: "C: ..." },
    { id: "4", text: "D: ..." },
  ],
  correct_option_id: "1", // khớp với id của đáp án đúng ở trên
  source: "Quy định 208-QĐ/TW", // không bắt buộc, để null nếu không có
}
```

Sau khi sửa, commit + push — Vercel tự build lại với bộ câu hỏi mới.

## 4. Đổi cấu hình (số câu / thời gian / điểm đạt)

Sửa các hằng số trong [`src/lib/config.ts`](./src/lib/config.ts):
`PRACTICE_GROUP_SIZE`, `PRACTICE_DURATION_MINUTES`, `EXAM_QUESTION_COUNT`,
`EXAM_DURATION_MINUTES`, `PASS_PERCENTAGE`, `MAX_PER_SOURCE`.

---

## Cấu trúc thư mục

```
src/
  app/                 Các trang (App Router): /, /practice, /practice/[group],
                        /exam, /exam/session, /exam/result/[attemptId], /history
  components/          Component dùng chung (Timer, ProgressMap, Navbar, ...)
  data/
    questions.ts       Toàn bộ 135 câu hỏi mặc định (nguồn dữ liệu duy nhất)
  lib/
    types.ts            Kiểu dữ liệu dùng chung
    config.ts            Cấu hình tĩnh (số câu/bộ, thời gian, điểm đạt, ...)
    examSelect.ts         Thuật toán bốc đề thi thử (random + giới hạn theo nguồn)
    localAttempts.ts      Đọc/ghi lịch sử làm bài + phiên thi đang dở vào localStorage
    shuffle.ts             Xáo trộn mảng / sắp xếp lại theo thứ tự đã lưu
    useCountdown.ts         Hook đếm ngược thời gian làm bài
```

## Giới hạn đã biết

- Đây là công cụ ôn luyện nội bộ, không phải phần mềm thi có giám sát: vì không có
  server chấm điểm riêng, người dùng có kỹ thuật vẫn có thể xem được đáp án đúng qua mã
  nguồn phía trình duyệt. Đánh đổi hợp lý để đổi lấy việc không cần server/database nào.
- Lịch sử làm bài chỉ lưu trên **từng trình duyệt/máy riêng lẻ** — không có bảng xếp hạng
  chung, không đồng bộ giữa các thiết bị.

## Đổi thương hiệu / giao diện

- Tên trang, màu sắc: sửa `src/app/layout.tsx` (metadata), `src/components/Navbar.tsx`,
  và bảng màu trong `tailwind.config.ts`.
- Toàn bộ giao diện dùng tiếng Việt, có thể sửa trực tiếp trong các file `.tsx` tương
  ứng.
