import Link from "next/link";
import { QUESTIONS } from "@/data/questions";
import { PRACTICE_GROUP_SIZE, PRACTICE_DURATION_MINUTES } from "@/lib/config";
import type { PracticeGroup } from "@/lib/types";

export default function PracticeGroupsPage() {
  const total = QUESTIONS.length;
  const numGroups = Math.ceil(total / PRACTICE_GROUP_SIZE);

  const groups: PracticeGroup[] = Array.from({ length: numGroups }, (_, i) => {
    const from = i * PRACTICE_GROUP_SIZE + 1;
    const to = Math.min((i + 1) * PRACTICE_GROUP_SIZE, total);
    return { group_no: i + 1, from, to, count: to - from + 1 };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ôn luyện</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn một bộ câu hỏi để luyện tập. Mỗi bộ làm trong {PRACTICE_DURATION_MINUTES} phút. Đáp án
          đúng/sai sẽ hiện ngay khi bạn chọn.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Link
            key={g.group_no}
            href={`/practice/${g.group_no}`}
            className="card flex flex-col gap-1 transition hover:shadow-md hover:ring-brand-300"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Bộ {g.group_no}
            </span>
            <span className="text-lg font-bold text-slate-900">
              Câu {g.from} - {g.to}
            </span>
            <span className="text-sm text-slate-500">
              {g.count} câu · {PRACTICE_DURATION_MINUTES} phút
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
