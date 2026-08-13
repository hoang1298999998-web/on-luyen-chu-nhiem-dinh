import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PracticeGroup } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PracticeGroupsPage() {
  const admin = createAdminClient();

  const [{ count }, { data: config }] = await Promise.all([
    admin.from("questions").select("id", { count: "exact", head: true }),
    admin.from("exam_config").select("*").eq("id", 1).maybeSingle(),
  ]);

  const total = count ?? 0;
  const groupSize = config?.practice_group_size ?? 50;
  const durationMinutes = config?.practice_duration_minutes ?? 30;
  const numGroups = Math.ceil(total / groupSize);

  const groups: PracticeGroup[] = Array.from({ length: numGroups }, (_, i) => {
    const from = i * groupSize + 1;
    const to = Math.min((i + 1) * groupSize, total);
    return { group_no: i + 1, from, to, count: to - from + 1 };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ôn luyện</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn một bộ câu hỏi để luyện tập. Mỗi bộ làm trong {durationMinutes} phút. Đáp án đúng/sai
          sẽ hiện ngay khi bạn chọn.
        </p>
      </div>

      {total === 0 ? (
        <div className="card text-center text-slate-500">
          Ngân hàng câu hỏi hiện chưa có dữ liệu. Vui lòng liên hệ quản trị viên để thêm câu hỏi.
        </div>
      ) : (
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
              <span className="text-sm text-slate-500">{g.count} câu · {durationMinutes} phút</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
