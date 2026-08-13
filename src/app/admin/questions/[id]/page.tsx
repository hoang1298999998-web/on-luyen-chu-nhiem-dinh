"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QuestionForm, { type QuestionFormValues } from "@/components/QuestionForm";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<QuestionFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/questions/${params.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Không tải được câu hỏi.");
        setInitial({
          content: json.question.content,
          options: json.question.options,
          correct_option_id: json.question.correct_option_id,
          source: json.question.source ?? "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được câu hỏi.");
      }
    })();
  }, [params.id]);

  async function handleSubmit(values: QuestionFormValues) {
    const res = await fetch(`/api/admin/questions/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: values.content,
        options: values.options,
        correct_option_id: values.correct_option_id,
        source: values.source || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Không thể lưu câu hỏi.");
    router.push("/admin/questions");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/questions" className="text-sm text-slate-500 hover:underline">
          ← Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Sửa câu hỏi</h1>
      </div>
      <div className="card">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !initial && <p className="text-sm text-slate-500">Đang tải...</p>}
        {initial && <QuestionForm initial={initial} submitLabel="Lưu thay đổi" onSubmit={handleSubmit} />}
      </div>
    </div>
  );
}
