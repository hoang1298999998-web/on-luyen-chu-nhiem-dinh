import { createAdminClient } from "@/lib/supabase/admin";
import ExamStartButton from "@/components/ExamStartButton";
import { DocIcon, ClockIcon, TargetIcon, LockIcon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function ExamIntroPage() {
  const admin = createAdminClient();
  const [{ data: config }, { count }] = await Promise.all([
    admin.from("exam_config").select("*").eq("id", 1).maybeSingle(),
    admin.from("questions").select("id", { count: "exact", head: true }),
  ]);

  const questionCount = Math.min(config?.exam_question_count ?? 50, count ?? 0);
  const durationMinutes = config?.exam_duration_minutes ?? 30;
  const passPercentage = config?.pass_percentage ?? 80;
  const totalQuestions = count ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">Thi thật</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mô phỏng bài thi thật: một bộ đề được bốc ngẫu nhiên từ toàn bộ ngân hàng câu hỏi.
        </p>

        <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-700">
          <li className="flex items-center gap-3">
            <DocIcon className="h-5 w-5 shrink-0 text-brand-600" /> Số câu hỏi: <b>{questionCount}</b> câu (ngẫu nhiên, đáp án xáo trộn)
          </li>
          <li className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 shrink-0 text-brand-600" /> Thời gian làm bài: <b>{durationMinutes} phút</b>
          </li>
          <li className="flex items-center gap-3">
            <TargetIcon className="h-5 w-5 shrink-0 text-brand-600" /> Điểm đạt: <b>≥ {passPercentage}%</b>
          </li>
          <li className="flex items-center gap-3">
            <LockIcon className="h-5 w-5 shrink-0 text-brand-600" /> Đáp án đúng chỉ hiện <b>sau khi nộp bài</b>
          </li>
        </ul>

        {totalQuestions === 0 ? (
          <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Ngân hàng câu hỏi hiện chưa có dữ liệu. Vui lòng liên hệ quản trị viên.
          </p>
        ) : (
          <ExamStartButton />
        )}
      </div>
    </div>
  );
}
