import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [{ count: questionCount }, { count: userCount }, { count: examAttemptCount }, { data: scores }] =
    await Promise.all([
      admin.from("questions").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("exam_attempts").select("id", { count: "exact", head: true }).eq("mode", "exam").eq("status", "submitted"),
      admin.from("exam_attempts").select("score").eq("mode", "exam").eq("status", "submitted").not("score", "is", null),
    ]);

  const avgScore =
    scores && scores.length > 0
      ? Math.round((scores.reduce((sum, s) => sum + Number(s.score), 0) / scores.length) * 100) / 100
      : null;

  const stats = [
    { label: "Câu hỏi trong ngân hàng đề", value: questionCount ?? 0, icon: "📚" },
    { label: "Người dùng đã đăng ký", value: userCount ?? 0, icon: "👥" },
    { label: "Lượt thi thật đã nộp", value: examAttemptCount ?? 0, icon: "📝" },
    { label: "Điểm trung bình thi thật", value: avgScore !== null ? `${avgScore}%` : "—", icon: "📊" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan quản trị</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý ngân hàng câu hỏi, nhập đề từ Excel và cấu hình bài thi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-2xl">{s.icon}</div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/upload" className="card transition hover:shadow-md hover:ring-brand-300">
          <h2 className="font-semibold text-slate-900">📥 Nhập câu hỏi từ Excel</h2>
          <p className="mt-1 text-sm text-slate-500">Tải lên file .xlsx để thêm hàng loạt câu hỏi.</p>
        </Link>
        <Link href="/admin/questions" className="card transition hover:shadow-md hover:ring-brand-300">
          <h2 className="font-semibold text-slate-900">📚 Quản lý câu hỏi</h2>
          <p className="mt-1 text-sm text-slate-500">Xem, sửa, xoá từng câu hỏi trong ngân hàng đề.</p>
        </Link>
        <Link href="/admin/settings" className="card transition hover:shadow-md hover:ring-brand-300">
          <h2 className="font-semibold text-slate-900">⚙️ Cấu hình đề thi</h2>
          <p className="mt-1 text-sm text-slate-500">Số câu, thời gian làm bài, điểm đạt, giới hạn theo nguồn.</p>
        </Link>
      </div>
    </div>
  );
}
