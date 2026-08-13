import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookIcon, UsersIcon, PencilIcon, ChartIcon, UploadIcon, GearIcon } from "@/components/Icon";

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
    { label: "Câu hỏi trong ngân hàng đề", value: questionCount ?? 0, Icon: BookIcon },
    { label: "Người dùng đã đăng ký", value: userCount ?? 0, Icon: UsersIcon },
    { label: "Lượt thi thật đã nộp", value: examAttemptCount ?? 0, Icon: PencilIcon },
    { label: "Điểm trung bình thi thật", value: avgScore !== null ? `${avgScore}%` : "—", Icon: ChartIcon },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Tổng quan quản trị</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý ngân hàng câu hỏi, nhập đề từ Excel và cấu hình bài thi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <s.Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-950">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/upload" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <UploadIcon className="h-5 w-5 text-brand-600" />
          <h2 className="mt-2 font-semibold text-brand-950">Nhập câu hỏi từ Excel</h2>
          <p className="mt-1 text-sm text-slate-500">Tải lên file .xlsx để thêm hàng loạt câu hỏi.</p>
        </Link>
        <Link href="/admin/questions" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <BookIcon className="h-5 w-5 text-brand-600" />
          <h2 className="mt-2 font-semibold text-brand-950">Quản lý câu hỏi</h2>
          <p className="mt-1 text-sm text-slate-500">Xem, sửa, xoá từng câu hỏi trong ngân hàng đề.</p>
        </Link>
        <Link href="/admin/settings" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <GearIcon className="h-5 w-5 text-brand-600" />
          <h2 className="mt-2 font-semibold text-brand-950">Cấu hình đề thi</h2>
          <p className="mt-1 text-sm text-slate-500">Số câu, thời gian làm bài, điểm đạt, giới hạn theo nguồn.</p>
        </Link>
      </div>
    </div>
  );
}
