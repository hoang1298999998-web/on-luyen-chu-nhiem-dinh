"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Timer from "@/components/Timer";
import ProgressMap, { type QuestionState } from "@/components/ProgressMap";
import { useCountdown } from "@/lib/useCountdown";
import type { ExamQuestion } from "@/lib/types";

export default function ExamSessionPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  // Luôn gọi lại /api/exam/start khi vào trang: server sẽ tự "tiếp tục" lượt thi
  // đang dang dở (nếu còn hạn) hoặc trả lỗi nếu không hợp lệ. Điều này giúp
  // việc tải lại trang (F5) không làm mất bài đang làm.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/exam/start", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Không thể tải phiên thi.");

        if (json.attempt_id !== params.attemptId) {
          router.replace(`/exam/session/${json.attempt_id}`);
        }

        setAttemptId(json.attempt_id);
        setQuestions(json.questions);
        setDurationSeconds(json.duration_seconds);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tải phiên thi.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.attemptId]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attemptId, answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể nộp bài.");
      router.push(`/exam/result/${attemptId}`);
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(e instanceof Error ? e.message : "Không thể nộp bài.");
    }
  }, [attemptId, answers, router]);

  const secondsLeft = useCountdown(durationSeconds ?? 0, () => {
    if (durationSeconds !== null) handleSubmit();
  });

  if (error) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={() => router.push("/exam")} className="btn-secondary mt-4">
          Quay lại
        </button>
      </div>
    );
  }

  if (!questions || durationSeconds === null) {
    return <div className="card text-center text-slate-500">Đang chuẩn bị đề thi...</div>;
  }

  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const states: QuestionState[] = questions.map((q) => (answers[q.id] ? "answered" : "unanswered"));

  function selectAnswer(optionId: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(totalQuestions - 1, index)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Thi thật</h1>
          <p className="text-sm text-slate-500">
            Đã trả lời {answeredCount}/{questions.length} câu
          </p>
        </div>
        <Timer secondsLeft={secondsLeft} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="card">
          <span className="text-sm font-semibold text-brand-600">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <p className="mt-2 text-base font-medium leading-relaxed text-slate-900">{current.content}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            {current.options.map((opt) => {
              const isSelected = answers[current.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectAnswer(opt.id)}
                  className={
                    "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition " +
                    (isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50")
                  }
                >
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs " +
                      (isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300")
                    }
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} className="btn-secondary">
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

          {confirmingSubmit ? (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                Bạn còn {questions.length - answeredCount} câu chưa trả lời. Nộp bài ngay?
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={handleSubmit} disabled={submitting} className="btn-danger flex-1">
                  {submitting ? "Đang nộp..." : "Nộp bài"}
                </button>
                <button onClick={() => setConfirmingSubmit(false)} className="btn-secondary flex-1">
                  Huỷ
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmingSubmit(true)} className="btn-danger mt-4 w-full">
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
