// Cấu hình tĩnh của trang web (thay cho bảng exam_config trước đây).
// Muốn đổi số câu/thời gian, sửa trực tiếp các hằng số dưới đây rồi deploy lại.

export const PRACTICE_GROUP_SIZE = 50;
export const PRACTICE_DURATION_MINUTES = 30;

export const EXAM_QUESTION_COUNT = 50;
export const EXAM_DURATION_MINUTES = 30;
export const PASS_PERCENTAGE = 80;

// Giới hạn số câu cùng 1 nguồn (Quy định / Hướng dẫn ...) trong 1 đề thi thử,
// để đề không bị dồn quá nhiều câu từ cùng một văn bản. null = không giới hạn.
export const MAX_PER_SOURCE = 4;
