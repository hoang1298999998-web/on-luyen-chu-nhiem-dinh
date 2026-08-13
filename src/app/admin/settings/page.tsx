"use client";

import { useEffect, useState } from "react";
import type { ExamConfig } from "@/lib/types";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/config");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Không tải được cấu hình.");
        setConfig(json.config);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được cấu hình.");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể lưu cấu hình.");
      setConfig(json.config);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return <div className="card text-center text-slate-500">{error ?? "Đang tải..."}</div>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cấu hình đề thi</h1>
        <p className="mt-1 text-sm text-slate-500">Áp dụng cho các lượt ôn luyện / thi thật mới bắt đầu sau khi lưu.</p>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Ôn luyện</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số câu mỗi bộ</label>
              <input
                type="number"
                min={1}
                className="input"
                value={config.practice_group_size}
                onChange={(e) => setConfig({ ...config, practice_group_size: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Thời gian làm bài (phút)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={config.practice_duration_minutes}
                onChange={(e) => setConfig({ ...config, practice_duration_minutes: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Thi thật</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số câu mỗi đề</label>
              <input
                type="number"
                min={1}
                className="input"
                value={config.exam_question_count}
                onChange={(e) => setConfig({ ...config, exam_question_count: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Thời gian làm bài (phút)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={config.exam_duration_minutes}
                onChange={(e) => setConfig({ ...config, exam_duration_minutes: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Điểm đạt (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                className="input"
                value={config.pass_percentage}
                onChange={(e) => setConfig({ ...config, pass_percentage: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Giới hạn số câu / nguồn (để trống = không giới hạn)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={config.max_per_source ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, max_per_source: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-correct-text">Đã lưu cấu hình.</p>}

        <button type="submit" disabled={saving} className="btn-primary self-start">
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </form>
    </div>
  );
}
