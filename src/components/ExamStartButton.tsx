"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exam/start", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể bắt đầu lượt thi.");
      router.push(`/exam/session/${json.attempt_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể bắt đầu lượt thi.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button onClick={handleStart} disabled={loading} className="btn-primary w-full">
        {loading ? "Đang chuẩn bị đề thi..." : "Bắt đầu thi"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
