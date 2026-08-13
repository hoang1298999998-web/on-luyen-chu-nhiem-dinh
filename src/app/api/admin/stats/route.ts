import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const [{ count: questionCount }, { count: userCount }, { count: examAttemptCount }] = await Promise.all([
    admin.from("questions").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("exam_attempts").select("id", { count: "exact", head: true }).eq("mode", "exam").eq("status", "submitted"),
  ]);

  const { data: scores } = await admin
    .from("exam_attempts")
    .select("score")
    .eq("mode", "exam")
    .eq("status", "submitted")
    .not("score", "is", null);

  const avgScore =
    scores && scores.length > 0
      ? Math.round((scores.reduce((sum, s) => sum + Number(s.score), 0) / scores.length) * 100) / 100
      : null;

  return NextResponse.json({
    question_count: questionCount ?? 0,
    user_count: userCount ?? 0,
    exam_attempt_count: examAttemptCount ?? 0,
    average_score: avgScore,
  });
}
