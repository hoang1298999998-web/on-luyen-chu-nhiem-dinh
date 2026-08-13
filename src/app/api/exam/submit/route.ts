import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResultQuestions, fetchQuestionsByIds, getExamConfig } from "@/lib/examServer";
import type { ExamAttempt, ExamResult } from "@/lib/types";

// Chấm điểm lượt thi thật ở phía server (không tin dữ liệu điểm số từ client).
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const attemptId: string | undefined = body?.attempt_id;
  const answers: Record<string, string> = body?.answers ?? {};

  if (!attemptId || typeof attemptId !== "string") {
    return NextResponse.json({ error: "Thiếu attempt_id." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: attemptRow, error: fetchError } = await admin
    .from("exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle();

  if (fetchError || !attemptRow) {
    return NextResponse.json({ error: "Không tìm thấy lượt thi." }, { status: 404 });
  }

  const attempt = attemptRow as ExamAttempt;

  if (attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Bạn không có quyền nộp bài này." }, { status: 403 });
  }

  const config = await getExamConfig();

  // Nộp lần đầu -> chấm điểm và lưu lại. Nếu đã nộp rồi (double-submit do mạng chậm) -> trả kết quả cũ, không chấm lại.
  if (attempt.status === "in_progress") {
    const questionsById = await fetchQuestionsByIds(attempt.question_ids);

    let correctCount = 0;
    const sanitizedAnswers: Record<string, string> = {};
    for (const qid of attempt.question_ids) {
      const selected = answers[qid];
      if (typeof selected !== "string") continue;
      sanitizedAnswers[qid] = selected;
      const row = questionsById.get(qid);
      if (row && selected === row.correct_option_id) correctCount += 1;
    }

    const totalCount = attempt.question_ids.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 10000) / 100 : 0;
    const submittedAt = new Date().toISOString();

    const { error: updateError } = await admin
      .from("exam_attempts")
      .update({
        answers: sanitizedAnswers,
        correct_count: correctCount,
        score,
        submitted_at: submittedAt,
        status: "submitted",
      })
      .eq("id", attempt.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    attempt.answers = sanitizedAnswers;
    attempt.correct_count = correctCount;
    attempt.score = score;
    attempt.submitted_at = submittedAt;
    attempt.status = "submitted";
  } else if (attempt.status === "expired") {
    return NextResponse.json({ error: "Phiên thi đã hết hạn và không thể nộp bài." }, { status: 400 });
  }

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
