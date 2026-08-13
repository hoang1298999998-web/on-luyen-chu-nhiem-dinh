import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResultQuestions, fetchQuestionsByIds, getExamConfig } from "@/lib/examServer";
import type { ExamAttempt, ExamResult } from "@/lib/types";

// Lấy lại kết quả của 1 lượt thi đã nộp (dùng cho trang kết quả khi tải lại trang).
export async function GET(request: NextRequest, { params }: { params: { attemptId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: attemptRow } = await admin
    .from("exam_attempts")
    .select("*")
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attemptRow) {
    return NextResponse.json({ error: "Không tìm thấy lượt thi." }, { status: 404 });
  }

  const attempt = attemptRow as ExamAttempt;

  if (attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Bạn không có quyền xem lượt thi này." }, { status: 403 });
  }

  if (attempt.status !== "submitted") {
    return NextResponse.json({ error: "Lượt thi này chưa được nộp." }, { status: 400 });
  }

  const config = await getExamConfig();
  const questionsById = await fetchQuestionsByIds(attempt.question_ids);
  const resultQuestions = buildResultQuestions(attempt, questionsById);

  const result: ExamResult = {
    attempt_id: attempt.id,
    mode: attempt.mode,
    correct_count: attempt.correct_count ?? 0,
    total_count: attempt.total_count,
    score: attempt.score ?? 0,
    pass_percentage: config.pass_percentage,
    passed: (attempt.score ?? 0) >= config.pass_percentage,
    duration_seconds: attempt.duration_seconds,
    started_at: attempt.started_at,
    submitted_at: attempt.submitted_at ?? new Date().toISOString(),
    questions: resultQuestions,
  };

  return NextResponse.json(result);
}
