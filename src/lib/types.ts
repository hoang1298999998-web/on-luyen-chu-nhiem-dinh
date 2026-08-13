// Các kiểu dữ liệu dùng chung trong toàn bộ ứng dụng.
// Khớp với schema trong supabase/schema.sql

export type QuestionOption = {
  id: string; // "1".."6" — id nội bộ trong phạm vi 1 câu hỏi, không phải id toàn cục
  text: string;
};

export type Question = {
  id: string;
  order_index: number;
  content: string;
  options: QuestionOption[];
  source: string | null;
  created_at: string;
};

// Câu hỏi kèm đáp án đúng — CHỈ dùng cho:
//  - Ôn luyện (lộ đáp án ngay khi bấm chọn)
//  - Trang admin quản lý câu hỏi
//  - Kết quả sau khi đã nộp bài thi thật
export type QuestionWithAnswer = Question & {
  correct_option_id: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
};

export type ExamConfig = {
  id: number;
  practice_group_size: number;
  practice_duration_minutes: number;
  exam_question_count: number;
  exam_duration_minutes: number;
  pass_percentage: number;
  max_per_source: number | null;
  updated_at: string;
};

export type AttemptMode = "practice" | "exam";
export type AttemptStatus = "in_progress" | "submitted" | "expired";

export type ExamAttempt = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  session_token: string | null;
  mode: AttemptMode;
  group_no: number | null;
  question_ids: string[];
  option_order: Record<string, string[]>;
  answers: Record<string, string>;
  correct_count: number | null;
  total_count: number;
  score: number | null;
  duration_seconds: number;
  started_at: string;
  submitted_at: string | null;
  status: AttemptStatus;
};

export type LeaderboardEntry = {
  user_id: string;
  full_name: string;
  score: number;
  correct_count: number;
  total_count: number;
  duration_seconds: number;
  submitted_at: string;
};

export type PracticeGroup = {
  group_no: number;
  from: number;
  to: number;
  count: number;
};

// Câu hỏi trả về cho phiên thi thật đang làm bài — KHÔNG có correct_option_id
export type ExamQuestion = {
  id: string;
  content: string;
  options: QuestionOption[];
};

export type ExamStartResponse = {
  attempt_id: string;
  duration_seconds: number;
  started_at: string;
  questions: ExamQuestion[];
};

export type ExamResultQuestion = {
  id: string;
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
};

export type ExamResult = {
  attempt_id: string;
  mode: AttemptMode;
  correct_count: number;
  total_count: number;
  score: number;
  pass_percentage: number;
  passed: boolean;
  duration_seconds: number;
  started_at: string;
  submitted_at: string;
  questions: ExamResultQuestion[];
};
