import ExamStartButton from "@/components/ExamStartButton";
import { DocIcon, ClockIcon, TargetIcon, LockIcon } from "@/components/Icon";
import { QUESTIONS } from "@/data/questions";
import { EXAM_QUESTION_COUNT, EXAM_DURATION_MINUTES, PASS_PERCENTAGE } from "@/lib/config";

export default function ExamIntroPage() {
  const questionCount = Math.min(EXAM_QUESTION_COUNT, QUESTIONS.length);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">Thi thử</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mô phỏng bài thi thật: một bộ đề được bốc ngẫu nhiên từ toàn bộ ngân hàng câu hỏi.
        </p>

        <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-700">
          <li className="flex items-center gap-3">
            <DocIcon className="h-5 w-5 shrink-0 text-brand-600" /> Số câu hỏi: <b>{questionCount}</b> câu (ngẫu nhiên, đáp án xáo trộn)
          </li>
          <li className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 shrink-0 text-brand-600" /> Thời gian làm bài: <b>{EXAM_DURATION_MINUTES} phút</b>
          </li>
          <li className="flex items-center gap-3">
            <TargetIcon className="h-5 w-5 shrink-0 text-brand-600" /> Điểm đạt: <b>≥ {PASS_PERCENTAGE}%</b>
          </li>
          <li className="flex items-center gap-3">
            <LockIcon className="h-5 w-5 shrink-0 text-brand-600" /> Đáp án đúng chỉ hiện <b>sau khi nộp bài</b>
          </li>
        </ul>

        <ExamStartButton />
      </div>
    </div>
  );
}
