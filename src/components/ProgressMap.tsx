"use client";

export type QuestionState = "unanswered" | "correct" | "wrong" | "answered";

export default function ProgressMap({
  states,
  currentIndex,
  onJump,
}: {
  states: QuestionState[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {states.map((state, i) => {
        const isCurrent = i === currentIndex;
        const base = "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold ring-1 transition";
        const colors =
          state === "correct"
            ? "bg-correct-bg text-correct-text ring-correct-border"
            : state === "wrong"
            ? "bg-wrong-bg text-wrong-text ring-wrong-border"
            : state === "answered"
            ? "bg-brand-100 text-brand-700 ring-brand-300"
            : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50";
        const current = isCurrent ? "outline outline-2 outline-offset-1 outline-brand-600" : "";
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            className={`${base} ${colors} ${current}`}
            title={`Câu ${i + 1}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
