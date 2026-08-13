"use client";

import { useState } from "react";
import type { QuestionOption } from "@/lib/types";

export type QuestionFormValues = {
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string;
};

const emptyOptions = (): QuestionOption[] => [
  { id: "1", text: "" },
  { id: "2", text: "" },
  { id: "3", text: "" },
  { id: "4", text: "" },
];

export default function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: QuestionFormValues;
  submitLabel: string;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [options, setOptions] = useState<QuestionOption[]>(initial?.options ?? emptyOptions());
  const [correctOptionId, setCorrectOptionId] = useState(initial?.correct_option_id ?? "1");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateOptionText(id: string, text: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  function addOption() {
    if (options.length >= 6) return;
    const nextId = String(Math.max(0, ...options.map((o) => Number(o.id) || 0)) + 1);
    setOptions((prev) => [...prev, { id: nextId, text: "" }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
    if (correctOptionId === id) setCorrectOptionId(options[0]?.id ?? "1");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }
    if (options.some((o) => !o.text.trim())) {
      setError("Vui lòng nhập đầy đủ nội dung các đáp án.");
      return;
    }
    if (!options.some((o) => o.id === correctOptionId)) {
      setError("Vui lòng chọn đáp án đúng.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ content: content.trim(), options, correct_option_id: correctOptionId, source: source.trim() });
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label">Nội dung câu hỏi</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input"
          placeholder="Nhập nội dung câu hỏi..."
        />
      </div>

      <div>
        <label className="label">Nguồn / Hướng dẫn (không bắt buộc)</label>
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="input"
          placeholder="VD: Chỉ thị 05-CT/TW..."
        />
        <p className="mt-1 text-xs text-slate-400">
          Nếu điền, hệ thống sẽ giới hạn số câu cùng nguồn trong 1 đề thi thật theo cấu hình.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Đáp án (chọn ô tròn để đánh dấu đáp án đúng)</label>
          {options.length < 6 && (
            <button type="button" onClick={addOption} className="text-sm font-medium text-brand-600 hover:underline">
              + Thêm đáp án
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_option"
                checked={correctOptionId === opt.id}
                onChange={() => setCorrectOptionId(opt.id)}
                className="h-4 w-4 shrink-0 accent-brand-600"
              />
              <input
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                className="input flex-1"
                placeholder={`Đáp án ${opt.id}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
