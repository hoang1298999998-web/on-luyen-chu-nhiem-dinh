"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Timer from "@/components/Timer";
import ProgressMap, { type QuestionState } from "@/components/ProgressMap";
import { useCountdown } from "@/lib/useCountdown";
import type { QuestionOption } from "@/lib/types";

type PracticeQuestion = {
  id: string;
  content: string;
  source: string | null;
  correct_option_id: string;
  options: QuestionOption[];
};

type PracticeData = {
  group_no: number;
  duration_seconds: number;
  questions: PracticeQuestion[];
};

export default function PracticeGroupPage() {
  const params = useParams<{ group: string }>();
  const groupNo = params.group;

  const [data, setData] = useState<PracticeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice/questions?group=${groupNo}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Có lỗi xảy ra, vui lòng thử lại.");
      setData(json as PracticeData);
      setSessionId((id) => id + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [groupNo]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="card text-center text-slate-500">Đang tải câu hỏi...</div>;
  }

  if (error || !data) {
    return (
      <div className="card text-center">
        <p className="text-red-600">{error ?? "Không tải được câu hỏi."}</p>
        <Link href="/practice" className="btn-secondary mt-4 inline-flex">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <PracticeRunner
      key={sessionId}
      groupNo={data.group_no}
      questions={data.questions}
      durationSeconds={data.duration_seconds}
      onRestart={load}
    />
  );
}

function PracticeRunner({
  groupNo,
  questions,
  durationSeconds,
  onRestart,
}: {
  groupNo: number;
  questions: PracticeQuestion[];
  durationSeconds: number;
  onRestart: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const secondsLeft = useCountdown(durationSeconds, () => setFinished(true));

  const current = questions[currentIndex];

  const states: QuestionState[] = questions.map((q) => {
    const chosen = answers[q.id];
    if (!chosen) return "unanswered";
    return chosen === q.correct_option_id ? "correct" : "wrong";
  });

  const correctCount = states.filter((s) => s === "correct").length;
  const wrongCount = states.filter((s) => s === "wrong").length;
  const unansweredCount = states.filter((s) => s === "unanswered").length;

  function handleSelect(optionId: string) {
    if (finished) return;
    if (answers[current.id]) return; // đã trả lời câu này rồi, khoá lại
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
  }

  const selectedForCurrent = answers[current.id];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/practice" className="text-sm text-slate-500 hover:underline">
            ← Quay lại danh sách
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Ôn luyện · Bộ {groupNo}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sm">
            <span className="rounded-full bg-correct-bg px-2.5 py-1 font-medium text-correct-text">
              Đúng {correctCount}
            </span>
            <span className="rounded-full bg-wrong-bg px-2.5 py-1 font-medium text-wrong-text">
              Sai {wrongCount}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              Chưa làm {unansweredCount}
            </span>
          </div>
          <Timer secondsLeft={secondsLeft} />
        </div>
      </div>

      {finished ? (
        <div className="card flex flex-col items-center gap-3 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            {secondsLeft === 0 ? "Hết giờ!" : "Đã kết thúc"}
          </h2>
          <p className="text-slate-600">
            Bạn trả lời đúng <span className="font-semibold text-correct-text">{correctCount}</span> /{" "}
            {questions.length} câu ({unansweredCount} câu chưa làm).
          </p>
          <div className="mt-2 flex gap-3">
            <button onClick={onRestart} className="btn-primary">
              Làm lại (xáo trộn mới)
            </button>
            <Link href="/practice" className="btn-secondary">
              Chọn bộ khác
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="card">
            <div className="mb-4 flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-brand-600">
                Câu {currentIndex + 1}/{questions.length}
              </span>
              {current.source && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {current.source}
                </span>
              )}
            </div>
            <p className="text-base font-medium leading-relaxed text-slate-900">{current.content}</p>

            <div className="mt-5 flex flex-col gap-2.5">
              {current.options.map((opt) => {
                const isSelected = selectedForCurrent === opt.id;
                const isCorrectOption = opt.id === current.correct_option_id;
                const showResult = !!selectedForCurrent;

                let style = "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50";
                if (showResult && isCorrectOption) {
                  style = "border-correct-border bg-correct-bg text-correct-text";
                } else if (showResult && isSelected && !isCorrectOption) {
                  style = "border-wrong-border bg-wrong-bg text-wrong-text";
                } else if (showResult) {
                  style = "border-slate-200 bg-white text-slate-400";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    disabled={showResult}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default ${style}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                      {showResult && isCorrectOption ? "✓" : showResult && isSelected ? "✕" : ""}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="btn-secondary"
              >
                ← Câu trước
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
                className="btn-primary"
              >
                Câu sau →
              </button>
            </div>
          </div>

          <div className="card h-fit">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Danh sách câu hỏi</h3>
            <ProgressMap states={states} currentIndex={currentIndex} onJump={goTo} />
            <button onClick={() => setFinished(true)} className="btn-secondary mt-4 w-full">
              Kết thúc ôn luyện
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
