import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardEntry } from "@/lib/types";

// Bảng xếp hạng: điểm CAO NHẤT của mỗi người dùng trong các lượt "thi thật" đã nộp.
// Xếp theo điểm giảm dần, cùng điểm thì ai làm nhanh hơn xếp trên.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: attempts, error } = await admin
    .from("exam_attempts")
    .select("user_id, score, correct_count, total_count, duration_seconds, started_at, submitted_at")
    .eq("mode", "exam")
    .eq("status", "submitted")
    .not("score", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ leaderboard: [] as LeaderboardEntry[] });
  }

  const userIds = Array.from(new Set(attempts.map((a) => a.user_id as string)));
  const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string]));

  const bestByUser = new Map<string, LeaderboardEntry & { _submittedAtMs: number }>();

  for (const a of attempts) {
    const userId = a.user_id as string;
    const score = Number(a.score);
    const timeTakenSeconds = Math.max(
      0,
      Math.round(
        (new Date(a.submitted_at as string).getTime() - new Date(a.started_at as string).getTime()) / 1000
      )
    );

    const candidate = {
      user_id: userId,
      full_name: nameById.get(userId) ?? "Người dùng",
      score,
      correct_count: a.correct_count as number,
      total_count: a.total_count as number,
      duration_seconds: timeTakenSeconds,
      submitted_at: a.submitted_at as string,
      _submittedAtMs: new Date(a.submitted_at as string).getTime(),
    };

    const existing = bestByUser.get(userId);
    if (
      !existing ||
      candidate.score > existing.score ||
      (candidate.score === existing.score && candidate.duration_seconds < existing.duration_seconds)
    ) {
      bestByUser.set(userId, candidate);
    }
  }

  const leaderboard: LeaderboardEntry[] = Array.from(bestByUser.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.duration_seconds - b.duration_seconds;
    })
    .slice(0, 100)
    .map(({ _submittedAtMs, ...rest }) => rest);

  return NextResponse.json({ leaderboard });
}
