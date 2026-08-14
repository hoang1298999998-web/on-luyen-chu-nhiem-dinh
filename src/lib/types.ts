// Các kiểu dữ liệu dùng chung. Trang web này không có database — toàn bộ câu hỏi
// nằm tĩnh trong src/data/questions.ts, lịch sử làm bài lưu trong localStorage
// của trình duyệt (xem src/lib/localAttempts.ts).

export type QuestionOption = {
  id: string; // "1".."4" — id nội bộ trong phạm vi 1 câu hỏi
  text: string;
};

export type Question = {
  id: string;
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string | null;
};

export type PracticeGroup = {
  group_no: number;
  from: number;
  to: number;
  count: number;
};

export type AttemptMode = "practice" | "exam";

// 1 câu hỏi đã "chốt" trong 1 lượt làm bài — lưu nguyên nội dung + thứ tự đáp án
// đã xáo trộn TẠI THỜI ĐIỂM làm bài, để xem lại lịch sử luôn khớp với điểm đã
// chấm, kể cả sau này bộ câu hỏi mặc định có được cập nhật/sửa lại.
export type AttemptQuestionSnapshot = {
  id: string;
  content: string;
  source: string | null;
  correct_option_id: string;
  options: QuestionOption[];
  selected_option_id: string | null;
};

export type Attempt = {
  id: string;
  mode: AttemptMode;
  group_no: number | null;
  display_name: string | null;
  questions: AttemptQuestionSnapshot[];
  correct_count: number;
  total_count: number;
  score: number; // phần trăm, 0-100
  duration_seconds: number; // thời gian được phép làm (kế hoạch)
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string;
};
