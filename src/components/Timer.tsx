"use client";

import { formatDuration } from "@/lib/useCountdown";

export default function Timer({ secondsLeft }: { secondsLeft: number }) {
  const isLow = secondsLeft <= 60;
  const isMedium = secondsLeft <= 300 && !isLow;

  return (
    <div
      className={
        "flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-bold tabular-nums " +
        (isLow
          ? "animate-pulse bg-red-100 text-red-700"
          : isMedium
          ? "bg-amber-100 text-amber-700"
          : "bg-slate-100 text-slate-700")
      }
    >
      ⏱ {formatDuration(secondsLeft)}
    </div>
  );
}
