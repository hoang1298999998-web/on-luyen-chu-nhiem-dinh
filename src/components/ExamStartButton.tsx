"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Không cần tài khoản để thi -> chỉ hỏi tên trước khi bắt đầu, dùng để hiện
// trên bảng xếp hạng. Tên được lưu lại trong trình duyệt cho lần thi sau.
export default function ExamStartButton() {
  const router = useRouter();
  const [name, setName] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("exam_display_name") ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên của bạn.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      window.localStorage.setItem("exam_display_name", trimmed);
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể bắt đầu lượt thi.");
      router.push(`/exam/session/${json.attempt_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể bắt đầu lượt thi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleStart} className="mt-6 flex flex-col gap-3">
      <div>
        <label className="label" htmlFor="display_name">
          Tên của bạn (hiện trên bảng xếp hạng)
        </label>
        <input
          id="display_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Nguyễn Văn A"
          maxLength={80}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Đang chuẩn bị đề thi..." : "Bắt đầu thi"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
