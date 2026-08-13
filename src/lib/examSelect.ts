import { shuffleArray } from "@/lib/shuffle";
import type { QuestionOption } from "@/lib/types";

export type SelectableQuestion = {
  id: string;
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string | null;
};

/**
 * Chọn ngẫu nhiên `count` câu hỏi từ `pool`, cố gắng KHÔNG lấy quá
 * `maxPerSource` câu cùng một "nguồn / hướng dẫn" (question.source) trong 1 đề.
 *
 * Thuật toán: xáo trộn toàn bộ pool, sau đó duyệt qua và ưu tiên nhận câu hỏi
 * nếu nguồn của nó chưa vượt quá giới hạn. Nếu duyệt hết 1 lượt mà vẫn chưa đủ
 * số câu yêu cầu (vì giới hạn quá chặt so với số nguồn sẵn có), sẽ nới lỏng dần
 * giới hạn cho tới khi đủ số câu — đảm bảo LUÔN trả về đúng `count` câu
 * (miễn là pool có đủ số câu), thay vì thất bại giữa chừng.
 *
 * Nếu maxPerSource là null/undefined, hoặc câu hỏi không có source, sẽ bỏ qua
 * ràng buộc và chỉ random thuần tuý.
 */
export function selectExamQuestions(
  pool: SelectableQuestion[],
  count: number,
  maxPerSource?: number | null
): SelectableQuestion[] {
  const target = Math.min(count, pool.length);
  if (target <= 0) return [];

  const hasSourceData = pool.some((q) => !!q.source);
  if (!maxPerSource || maxPerSource <= 0 || !hasSourceData) {
    return shuffleArray(pool).slice(0, target);
  }

  const shuffled = shuffleArray(pool);
  const selected: SelectableQuestion[] = [];
  const usedIds = new Set<string>();

  // Tăng dần giới hạn mỗi nguồn cho tới khi đủ số câu yêu cầu.
  // Vòng lặp tối đa = số câu trong pool nên luôn kết thúc (không thể vô hạn).
  let currentCap = maxPerSource;
  const maxPossibleCap = pool.length;

  while (selected.length < target && currentCap <= maxPossibleCap) {
    const sourceCounts = new Map<string, number>();
    for (const q of selected) {
      const key = q.source ?? "__none__";
      sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
    }

    for (const q of shuffled) {
      if (selected.length >= target) break;
      if (usedIds.has(q.id)) continue;

      const key = q.source ?? "__none__";
      const used = sourceCounts.get(key) ?? 0;
      if (used < currentCap) {
        selected.push(q);
        usedIds.add(q.id);
        sourceCounts.set(key, used + 1);
      }
    }

    currentCap += 1;
  }

  return shuffleArray(selected);
}
