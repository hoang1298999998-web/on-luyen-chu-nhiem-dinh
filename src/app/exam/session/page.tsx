"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Timer from "@/components/Timer";
import ProgressMap, { type QuestionState } from "@/components/ProgressMap";
import { useCountdown } from "@/lib/useCountdown";
import { shuffleArray, reorderById, optionLabel } from "@/lib/shuffle";
import { selectExamQuestions } from "@/lib/examSelect";
import { QUESTIONS } from "@/data/questions";
import { EXAM_QUESTION_COUNT, EXAM_DURATION_MINUTES, MAX_PER_SOURCE } from "@/lib/config";
import {
  getCurrentExam,
  saveCurrentExam,
  clearCurrentExam,
  saveAttempt,
  getDisplayName,
  type CurrentExam,
} from "@/lib/localAttempts";
import type { Attempt, QuestionOption } from "@/lib/types";

const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

function createExam(): CurrentExam {
  const selected = selectExamQuestions(QUESTIONS, Math.min(EXAM_QUESTION_COUNT, QUESTIONS.length), MAX_PER_SOURCE);
  const option_order: Record<string, string[]> = {};
  for (const q of selected) {
    option_order[q.id] = shuffleArray(q.options.map((o) => o.id));
  }
  return {
    id: crypto.randomUUID(),
    started_at: new Date().toISOString(),
    duration_seconds: EXAM_DURATION_MINUTES * 60,
    display_name: getDisplayName() || null,
    question_ids: selected.map((q) => q.id),
    option_order,
    answers: {},
  };
}

function secondsElapsedSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
}

export default function ExamSessionPage() {
  const router = useRouter();
  const [exam, setExam] = useState<CurrentExam | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const existing = getCurrentExam();
    if (existing && secondsElapsedSince(existing.started_at) < existing.duration_seconds) {
      setExam(existing);
    } else {
      const fresh = createExam();
      saveCurrentExam(fresh);
      setExam(fresh);
    }
  }, []);

  const questions = useMemo(() => {
    if (!exam) return [];
    return exam.question_ids
      .map((id) => QUESTIONS_BY_ID.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => ({ ...q, options: reorderById<QuestionOption>(q.options, exam.option_order[q.id]) }));
  }, [exam]);

  const handleSubmit = useMemo(
    () => () => {
      if (submittedRef.current || !exam) return;
      submittedRef.current = true;

      const now = new Date();
      const attemptQuestions = questions.map((q) => ({
        id: q.id,
        content: q.content,
        source: q.source,
        correct_option_id: q.correct_option_id,
        options: q.options,
        selected_option_id: exam.answers[q.id] ?? null,
      }));
      const correctCount = attemptQuestions.filter((q) => q.selected_option_id === q.correct_option_id).length;

      const attempt: Attempt = {
        id: exam.id,
        mode: "exam",
        group_no: null,
        display_name: exam.display_name,
        questions: attemptQuestions,
        correct_count: correctCount,
        total_count: attemptQuestions.length,
        score: attemptQuestions.length > 0 ? Math.round((correctCount / attemptQuestions.length) * 100) : 0,
        duration_seconds: exam.duration_seconds,
        time_taken_seconds: secondsElapsedSince(exam.started_at),
        started_at: exam.started_at,
        submitted_at: now.toISOString(),
      };

      saveAttempt(attempt);
      clearCurrentExam();
      router.push(`/exam/result/${attempt.id}`);
    },
    [exam, questions, router]
  );

  const initialSecondsLeft = exam
    ? Math.max(0, exam.duration_seconds - secondsElapsedSince(exam.started_at))
    : 0;
  const secondsLeft = useCountdown(initialSecondsLeft, () => {
    if (exam) handleSubmit();
  });

  if (!exam || questions.length === 0) {
    return <div className="card text-center text-slate-500">Đang chuẩn bị đề thi...</div>;
  }

  const current = questions[currentIndex];
  const answeredCount = Object.keys(exam.answers).length;
  const states: QuestionState[] = questions.map((q) => (exam.answers[q.id] ? "answered" : "unanswered"));

  function selectAnswer(optionId: string) {
    setExam((prev) => {
      if (!prev) return prev;
      const updated: CurrentExam = { ...prev, answers: { ...prev.answers, [current.id]: optionId } };
      saveCurrentExam(updated);
      return updated;
    });
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Thi thử</h1>
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
            {current.options.map((opt, optIndex) => {
              const isSelected = exam.answers[current.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectAnswer(opt.id)}
                  className={
                    "flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition " +
                    (isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50")
                  }
                >
                  <span
                    className={
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs " +
                      (isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300")
                    }
                  >
                    {isSelected ? "✓" : optionLabel(optIndex)}
                  </span>
                  <span className="whitespace-pre-line">{opt.text}</span>
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
              <p>Bạn còn {questions.length - answeredCount} câu chưa trả lời. Nộp bài ngay?</p>
              <div className="mt-2 flex gap-2">
                <button onClick={handleSubmit} className="btn-danger flex-1">
                  Nộp bài
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
