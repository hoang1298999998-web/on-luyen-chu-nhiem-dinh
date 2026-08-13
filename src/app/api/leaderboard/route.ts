import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardEntry } from "@/lib/types";

// Bảng xếp hạng: điểm CAO NHẤT của mỗi tên trong các lượt "thi thật" đã nộp.
// Không cần đăng nhập -> gộp theo display_name (tên người dùng tự gõ trước khi thi).
// Xếp theo điểm giảm dần, cùng điểm thì ai làm nhanh hơn xếp trên.
export async function GET() {
  const admin = createAdminClient();

  const { data: attempts, error } = await admin
    .from("exam_attempts")
    .select("display_name, score, correct_count, total_count, duration_seconds, started_at, submitted_at")
    .eq("mode", "exam")
    .eq("status", "submitted")
    .not("score", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ leaderboard: [] as LeaderboardEntry[] });
  }

  const bestByName = new Map<string, LeaderboardEntry & { _submittedAtMs: number }>();

  for (const a of attempts) {
    const name = ((a.display_name as string | null) ?? "").trim() || "Người dùng";
    const score = Number(a.score);
    const timeTakenSeconds = Math.max(
      0,
      Math.round(
        (new Date(a.submitted_at as string).getTime() - new Date(a.started_at as string).getTime()) / 1000
      )
    );

    const candidate = {
      user_id: name,
      full_name: name,
      score,
      correct_count: a.correct_count as number,
      total_count: a.total_count as number,
      duration_seconds: timeTakenSeconds,
      submitted_at: a.submitted_at as string,
      _submittedAtMs: new Date(a.submitted_at as string).getTime(),
    };

    const key = name.toLowerCase();
    const existing = bestByName.get(key);
    if (
      !existing ||
      candidate.score > existing.score ||
      (candidate.score === existing.score && candidate.duration_seconds < existing.duration_seconds)
    ) {
      bestByName.set(key, candidate);
    }
  }

  const leaderboard: LeaderboardEntry[] = Array.from(bestByName.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.duration_seconds - b.duration_seconds;
    })
    .slice(0, 100)
    .map(({ _submittedAtMs, ...rest }) => rest);

  return NextResponse.json({ leaderboard });
}
