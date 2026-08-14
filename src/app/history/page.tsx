"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory } from "@/lib/localAttempts";
import { PASS_PERCENTAGE } from "@/lib/config";
import type { Attempt } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Attempt[] | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleClear() {
    if (!window.confirm("Xoá toàn bộ lịch sử làm bài trên máy này?")) return;
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử làm bài</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lưu trên trình duyệt của máy này — đổi máy/trình duyệt khác hoặc xoá dữ liệu trình duyệt sẽ
            mất lịch sử.
          </p>
        </div>
        {history && history.length > 0 && (
          <button onClick={handleClear} className="btn-secondary">
            Xoá lịch sử
          </button>
        )}
      </div>

      {history === null ? (
        <div className="card text-center text-slate-500">Đang tải...</div>
      ) : history.length === 0 ? (
        <div className="card text-center text-slate-500">
          Bạn chưa làm bài lần nào trên máy này. Vào{" "}
          <Link href="/practice" className="text-brand-600 hover:underline">
            Ôn luyện
          </Link>{" "}
          hoặc{" "}
          <Link href="/exam" className="text-brand-600 hover:underline">
            Thi thử
          </Link>{" "}
          để bắt đầu.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((a) => {
            const passed = a.mode === "exam" && a.score >= PASS_PERCENTAGE;
            const content = (
              <div className="card flex flex-wrap items-center justify-between gap-3 transition hover:shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                        a.mode === "exam" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.mode === "exam" ? "Thi thử" : `Ôn luyện · Bộ ${a.group_no}`}
                    </span>
                    {a.mode === "exam" && (
                      <span
                        className={`text-xs font-semibold ${passed ? "text-correct-text" : "text-wrong-text"}`}
                      >
                        {passed ? "Đạt" : "Chưa đạt"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(a.submitted_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {a.correct_count}/{a.total_count} câu
                  </p>
                  <p className="text-sm text-slate-500">{a.score}%</p>
                </div>
              </div>
            );
            return a.mode === "exam" ? (
              <Link key={a.id} href={`/exam/result/${a.id}`}>
                {content}
              </Link>
            ) : (
              <div key={a.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
