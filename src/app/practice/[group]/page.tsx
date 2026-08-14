"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Timer from "@/components/Timer";
import ProgressMap, { type QuestionState } from "@/components/ProgressMap";
import { useCountdown } from "@/lib/useCountdown";
import { shuffleArray, optionLabel } from "@/lib/shuffle";
import { QUESTIONS } from "@/data/questions";
import { PRACTICE_GROUP_SIZE, PRACTICE_DURATION_MINUTES } from "@/lib/config";
import { saveAttempt } from "@/lib/localAttempts";
import type { Attempt, Question } from "@/lib/types";

function buildSession(groupNo: number): Question[] {
  const from = (groupNo - 1) * PRACTICE_GROUP_SIZE;
  const to = from + PRACTICE_GROUP_SIZE;
  return QUESTIONS.slice(from, to).map((q) => ({ ...q, options: shuffleArray(q.options) }));
}

export default function PracticeGroupPage() {
  const params = useParams<{ group: string }>();
  const groupNo = Number(params.group);
  const isValidGroup = Number.isInteger(groupNo) && groupNo >= 1;
  const [sessionId, setSessionId] = useState(0);
  // Xáo trộn đáp án bằng Math.random() nên CHỈ được tính ở client (sau khi mount),
  // không được tính trong lúc render (kể cả render đầu ở client) — nếu không sẽ
  // lệch với HTML server trả về và gây lỗi hydration.
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    setQuestions(isValidGroup ? buildSession(groupNo) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupNo, sessionId]);

  if (!isValidGroup) {
    return (
      <div className="card text-center">
        <p className="text-red-600">Bộ câu hỏi không hợp lệ.</p>
        <Link href="/practice" className="btn-secondary mt-4 inline-flex">
          Quay lại
        </Link>
      </div>
    );
  }

  if (questions === null) {
    return <div className="card text-center text-slate-500">Đang tải câu hỏi...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-red-600">Không tìm thấy câu hỏi cho bộ này.</p>
        <Link href="/practice" className="btn-secondary mt-4 inline-flex">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <PracticeRunner
      key={sessionId}
      groupNo={groupNo}
      questions={questions}
      durationSeconds={PRACTICE_DURATION_MINUTES * 60}
      onRestart={() => setSessionId((id) => id + 1)}
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
  questions: Question[];
  durationSeconds: number;
  onRestart: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const savedRef = useRef(false);

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

  function finishNow() {
    setFinished(true);
  }

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      mode: "practice",
      group_no: groupNo,
      display_name: null,
      questions: questions.map((q) => ({
        id: q.id,
        content: q.content,
        source: q.source,
        correct_option_id: q.correct_option_id,
        options: q.options,
        selected_option_id: answers[q.id] ?? null,
      })),
      correct_count: correctCount,
      total_count: questions.length,
      score: Math.round((correctCount / questions.length) * 100),
      duration_seconds: durationSeconds,
      time_taken_seconds: Math.max(0, durationSeconds - secondsLeft),
      started_at: startedAt,
      submitted_at: new Date().toISOString(),
    };
    saveAttempt(attempt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

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
        <div className="flex flex-col gap-6">
          <div className="card flex flex-col items-center gap-3 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              {secondsLeft === 0 ? "Hết giờ!" : "Đã kết thúc"}
            </h2>
            <p className="text-slate-600">
              Bạn trả lời đúng <span className="font-semibold text-correct-text">{correctCount}</span> /{" "}
              {questions.length} câu ({unansweredCount} câu chưa làm).
            </p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => {
                  savedRef.current = false;
                  onRestart();
                }}
                className="btn-primary"
              >
                Làm lại (xáo trộn mới)
              </button>
              <Link href="/practice" className="btn-secondary">
                Chọn bộ khác
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Xem lại toàn bộ bài làm</h2>
            <div className="flex flex-col gap-5">
              {questions.map((q, i) => {
                const selected = answers[q.id];
                return (
                  <div key={q.id} className="border-b border-slate-100 pb-5 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-500">Câu {i + 1}</p>
                      {q.source && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {q.source}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-medium text-slate-900">{q.content}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {q.options.map((opt, optIndex) => {
                        const isCorrectOption = opt.id === q.correct_option_id;
                        const isSelected = opt.id === selected;
                        let style = "border-slate-200 text-slate-600";
                        if (isCorrectOption) style = "border-correct-border bg-correct-bg text-correct-text";
                        else if (isSelected) style = "border-wrong-border bg-wrong-bg text-wrong-text";
                        return (
                          <div key={opt.id} className={`rounded-lg border-2 px-3 py-2 text-sm ${style}`}>
                            <span className="whitespace-pre-line">
                              <b>{optionLabel(optIndex)}.</b> {opt.text}
                            </span>
                            {isCorrectOption && <span className="ml-2 font-semibold">✓ Đáp án đúng</span>}
                            {isSelected && !isCorrectOption && (
                              <span className="ml-2 font-semibold">✕ Bạn đã chọn</span>
                            )}
                          </div>
                        );
                      })}
                      {!selected && <p className="text-xs italic text-slate-400">Bạn chưa trả lời câu này.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
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
              {current.options.map((opt, optIndex) => {
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
                    className={`flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default ${style}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                      {showResult && isCorrectOption
                        ? "✓"
                        : showResult && isSelected
                        ? "✕"
                        : optionLabel(optIndex)}
                    </span>
                    <span className="whitespace-pre-line">{opt.text}</span>
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
            <button onClick={finishNow} className="btn-secondary mt-4 w-full">
              Kết thúc ôn luyện
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
