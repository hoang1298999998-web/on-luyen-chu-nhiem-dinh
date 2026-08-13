"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import QuestionForm, { type QuestionFormValues } from "@/components/QuestionForm";

export default function NewQuestionPage() {
  const router = useRouter();

  async function handleSubmit(values: QuestionFormValues) {
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: values.content,
        options: values.options,
        correct_option_id: values.correct_option_id,
        source: values.source || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Không thể tạo câu hỏi.");
    router.push("/admin/questions");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/questions" className="text-sm text-slate-500 hover:underline">
          ← Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Thêm câu hỏi mới</h1>
      </div>
      <div className="card">
        <QuestionForm submitLabel="Tạo câu hỏi" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
