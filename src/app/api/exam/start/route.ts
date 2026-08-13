import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { selectExamQuestions, type SelectableQuestion } from "@/lib/examSelect";
import { shuffleArray } from "@/lib/shuffle";
import { getExamConfig, reorderOptions, secondsElapsedSince } from "@/lib/examServer";
import type { ExamAttempt, ExamQuestion, ExamStartResponse } from "@/lib/types";

// Bắt đầu (hoặc tiếp tục) một lượt thi thật.
// - Nếu người dùng đang có 1 lượt "in_progress" chưa hết giờ -> trả về lượt đó (để refresh trang không mất bài).
// - Nếu lượt cũ đã hết giờ -> đánh dấu "expired" rồi tạo lượt mới.
// - Nếu chưa có lượt nào -> bốc đề mới: random toàn bộ ngân hàng câu hỏi,
//   giới hạn số câu cùng nguồn theo cấu hình, xáo trộn đáp án từng câu.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();
  const config = await getExamConfig();

  const { data: existing } = await admin
    .from("exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("mode", "exam")
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const attempt = existing as ExamAttempt;
    const elapsed = secondsElapsedSince(attempt.started_at);
    const remaining = attempt.duration_seconds - elapsed;

    if (remaining > 0) {
      const { data: rows } = await admin
        .from("questions")
        .select("id, content, options")
        .in("id", attempt.question_ids);

      const byId = new Map((rows ?? []).map((r) => [r.id as string, r]));
      const questions: ExamQuestion[] = attempt.question_ids
        .map((qid) => {
          const row = byId.get(qid);
          if (!row) return null;
          return {
            id: qid,
            content: row.content as string,
            options: reorderOptions(row.options as ExamQuestion["options"], attempt.option_order[qid]),
          } satisfies ExamQuestion;
        })
        .filter((q): q is ExamQuestion => q !== null);

      const response: ExamStartResponse = {
        attempt_id: attempt.id,
        duration_seconds: remaining,
        started_at: attempt.started_at,
        questions,
      };
      return NextResponse.json(response);
    }

    // Đã hết giờ nhưng chưa được nộp (vd người dùng đóng tab) -> đánh dấu hết hạn.
    await admin
      .from("exam_attempts")
      .update({ status: "expired", submitted_at: new Date().toISOString() })
      .eq("id", attempt.id);
  }

  // Bốc đề mới
  const { data: pool, error: poolError } = await admin
    .from("questions")
    .select("id, content, options, correct_option_id, source");

  if (poolError) {
    return NextResponse.json({ error: poolError.message }, { status: 500 });
  }

  if (!pool || pool.length === 0) {
    return NextResponse.json(
      { error: "Ngân hàng câu hỏi hiện chưa có dữ liệu. Vui lòng liên hệ quản trị viên." },
      { status: 400 }
    );
  }

  const selected = selectExamQuestions(
    pool as SelectableQuestion[],
    config.exam_question_count,
    config.max_per_source
  );

  const optionOrder: Record<string, string[]> = {};
  const questions: ExamQuestion[] = selected.map((q) => {
    const shuffledOptions = shuffleArray(q.options);
    optionOrder[q.id] = shuffledOptions.map((o) => o.id);
    return { id: q.id, content: q.content, options: shuffledOptions };
  });

  const durationSeconds = config.exam_duration_minutes * 60;

  const { data: created, error: insertError } = await admin
    .from("exam_attempts")
    .insert({
      user_id: user.id,
      mode: "exam",
      question_ids: selected.map((q) => q.id),
      option_order: optionOrder,
      answers: {},
      total_count: selected.length,
      duration_seconds: durationSeconds,
      status: "in_progress",
    })
    .select("id, started_at")
    .single();

  if (insertError || !created) {
    return NextResponse.json(
      { error: insertError?.message ?? "Không thể tạo lượt thi." },
      { status: 500 }
    );
  }

  const response: ExamStartResponse = {
    attempt_id: created.id as string,
    duration_seconds: durationSeconds,
    started_at: created.started_at as string,
    questions,
  };

  return NextResponse.json(response);
}
