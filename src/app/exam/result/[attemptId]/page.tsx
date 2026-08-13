"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ExamResult } from "@/lib/types";

export default function ExamResultPage() {
  const params = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/exam/${params.attemptId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Không tải được kết quả.");
        setResult(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được kết quả.");
      }
    })();
  }, [params.attemptId]);

  if (error) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/exam" className="btn-secondary mt-4 inline-flex">
          Quay lại
        </Link>
      </div>
    );
  }

  if (!result) {
    return <div className="card text-center text-slate-500">Đang tải kết quả...</div>;
  }

  const wrongCount = result.total_count - result.correct_count;
  const timeTakenSeconds = Math.max(
    0,
    Math.round((new Date(result.submitted_at).getTime() - new Date(result.started_at).getTime()) / 1000)
  );
  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;

  return (
    <div className="flex flex-col gap-6">
      <div className={`card text-center ${result.passed ? "" : ""}`}>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Kết quả thi thật</p>
        <p
          className={`mt-2 text-5xl font-extrabold ${
            result.passed ? "text-correct-text" : "text-wrong-text"
          }`}
        >
          {result.score}%
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-800">
          {result.passed ? "✅ Đạt yêu cầu" : "❌ Chưa đạt"}
          <span className="ml-2 font-normal text-slate-500">(cần ≥ {result.pass_percentage}%)</span>
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-correct-bg p-3">
            <p className="text-2xl font-bold text-correct-text">{result.correct_count}</p>
            <p className="text-correct-text">Câu đúng</p>
          </div>
          <div className="rounded-lg bg-wrong-bg p-3">
            <p className="text-2xl font-bold text-wrong-text">{wrongCount}</p>
            <p className="text-wrong-text">Câu sai</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-2xl font-bold text-slate-700">
              {minutes}p{seconds.toString().padStart(2, "0")}s
            </p>
            <p className="text-slate-600">Thời gian làm bài</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/exam" className="btn-primary">
            Thi lại
          </Link>
          <Link href="/leaderboard" className="btn-secondary">
            Xem bảng xếp hạng
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Xem lại bài làm</h2>
        <div className="flex flex-col gap-5">
          {result.questions.map((q, i) => (
            <div key={q.id} className="border-b border-slate-100 pb-5 last:border-0">
              <p className="text-sm font-semibold text-slate-500">Câu {i + 1}</p>
              <p className="mt-1 font-medium text-slate-900">{q.content}</p>
              <div className="mt-3 flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isCorrectOption = opt.id === q.correct_option_id;
                  const isSelected = opt.id === q.selected_option_id;
                  let style = "border-slate-200 text-slate-600";
                  if (isCorrectOption) style = "border-correct-border bg-correct-bg text-correct-text";
                  else if (isSelected) style = "border-wrong-border bg-wrong-bg text-wrong-text";
                  return (
                    <div key={opt.id} className={`rounded-lg border-2 px-3 py-2 text-sm ${style}`}>
                      <span className="whitespace-pre-line">{opt.text}</span>
                      {isCorrectOption && <span className="ml-2 font-semibold">✓ Đáp án đúng</span>}
                      {isSelected && !isCorrectOption && <span className="ml-2 font-semibold">✕ Bạn đã chọn</span>}
                    </div>
                  );
                })}
                {!q.selected_option_id && (
                  <p className="text-xs italic text-slate-400">Bạn chưa trả lời câu này.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
