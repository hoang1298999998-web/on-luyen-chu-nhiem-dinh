import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamAttempt, ExamConfig, ExamResultQuestion, QuestionOption } from "@/lib/types";

export type QuestionRow = {
  id: string;
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string | null;
};

export async function getExamConfig(): Promise<ExamConfig> {
  const admin = createAdminClient();
  const { data } = await admin.from("exam_config").select("*").eq("id", 1).maybeSingle();

  return {
    id: 1,
    practice_group_size: data?.practice_group_size ?? 50,
    practice_duration_minutes: data?.practice_duration_minutes ?? 30,
    exam_question_count: data?.exam_question_count ?? 50,
    exam_duration_minutes: data?.exam_duration_minutes ?? 30,
    pass_percentage: data?.pass_percentage ?? 80,
    max_per_source: data?.max_per_source ?? null,
    updated_at: data?.updated_at ?? new Date().toISOString(),
  };
}

// Sắp xếp lại mảng đáp án của 1 câu hỏi theo thứ tự id đã lưu khi bắt đầu phiên thi,
// để mỗi lần tải lại trang thi vẫn thấy đúng thứ tự đáp án đã xáo trộn ban đầu.
export function reorderOptions(options: QuestionOption[], order: string[] | undefined): QuestionOption[] {
  if (!order || order.length === 0) return options;
  const byId = new Map(options.map((o) => [o.id, o]));
  const reordered = order
    .map((id) => byId.get(id))
    .filter((o): o is QuestionOption => Boolean(o));
  for (const o of options) {
    if (!order.includes(o.id)) reordered.push(o);
  }
  return reordered;
}

export async function fetchQuestionsByIds(ids: string[]): Promise<Map<string, QuestionRow>> {
  if (ids.length === 0) return new Map();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("questions")
    .select("id, content, options, correct_option_id, source")
    .in("id", ids);

  if (error) throw new Error(error.message);

  const map = new Map<string, QuestionRow>();
  for (const row of data ?? []) {
    map.set(row.id as string, row as QuestionRow);
  }
  return map;
}

export function secondsElapsedSince(isoTimestamp: string): number {
  return Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 1000);
}

export function buildResultQuestions(
  attempt: Pick<ExamAttempt, "question_ids" | "option_order" | "answers">,
  questionsById: Map<string, QuestionRow>
): ExamResultQuestion[] {
  const result: ExamResultQuestion[] = [];
  for (const qid of attempt.question_ids) {
    const row = questionsById.get(qid);
    if (!row) continue;
    const options = reorderOptions(row.options, attempt.option_order[qid]);
    const selected: string | null = attempt.answers[qid] ?? null;
    result.push({
      id: qid,
      content: row.content,
      options,
      correct_option_id: row.correct_option_id,
      selected_option_id: selected,
      is_correct: selected !== null && selected === row.correct_option_id,
    });
  }
  return result;
}
