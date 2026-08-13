"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Không tải được bảng xếp hạng.");
        setEntries(json.leaderboard);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được bảng xếp hạng.");
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng xếp hạng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Điểm cao nhất của mỗi người trong các lượt thi thật đã nộp bài. Bằng điểm thì ai làm nhanh
          hơn xếp trên.
        </p>
      </div>

      {error && <div className="card text-red-600">{error}</div>}

      {!error && entries === null && <div className="card text-center text-slate-500">Đang tải...</div>}

      {entries !== null && entries.length === 0 && (
        <div className="card text-center text-slate-500">Chưa có ai hoàn thành lượt thi thật nào.</div>
      )}

      {entries !== null && entries.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Đúng/Tổng</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e, i) => (
                <tr key={e.user_id} className={i < 3 ? "bg-amber-50/50" : ""}>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{e.full_name}</td>
                  <td className="px-4 py-3 font-bold text-brand-700">{e.score}%</td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.correct_count}/{e.total_count}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {Math.floor(e.duration_seconds / 60)}p{(e.duration_seconds % 60).toString().padStart(2, "0")}s
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(e.submitted_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
