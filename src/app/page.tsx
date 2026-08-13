import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  let totalQuestions = 0;
  if (profile) {
    // Bảng questions chỉ admin đọc trực tiếp được (RLS), nên dùng admin client
    // phía server để đếm số câu hỏi công khai (không lộ nội dung/đáp án).
    const supabaseAdmin = createAdminClient();
    const { count } = await supabaseAdmin
      .from("questions")
      .select("id", { count: "exact", head: true });
    totalQuestions = count ?? 0;
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="card bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Ôn luyện & thi thử BTCB 2026</h1>
        <p className="mt-2 max-w-2xl text-brand-100">
          Luyện tập theo từng bộ 50 câu với phản hồi đúng/sai ngay lập tức, hoặc làm một đề thi thử
          được xáo trộn ngẫu nhiên trong 30 phút giống như thi thật.
        </p>
        {!profile && (
          <div className="mt-6 flex gap-3">
            <Link href="/register" className="btn bg-white text-brand-700 hover:bg-brand-50">
              Đăng ký ngay
            </Link>
            <Link href="/login" className="btn bg-brand-700/40 text-white ring-1 ring-inset ring-white/40 hover:bg-brand-700/60">
              Đăng nhập
            </Link>
          </div>
        )}
      </section>

      {profile && (
        <section className="grid gap-5 sm:grid-cols-3">
          <Link href="/practice" className="card transition hover:shadow-md hover:ring-brand-300">
            <div className="mb-2 text-3xl">📘</div>
            <h2 className="text-lg font-semibold text-slate-900">Ôn luyện</h2>
            <p className="mt-1 text-sm text-slate-500">
              Làm từng bộ 50 câu, biết đúng/sai ngay khi chọn đáp án. Hiện có {totalQuestions} câu hỏi
              trong ngân hàng đề.
            </p>
          </Link>

          <Link href="/exam" className="card transition hover:shadow-md hover:ring-brand-300">
            <div className="mb-2 text-3xl">📝</div>
            <h2 className="text-lg font-semibold text-slate-900">Thi thật</h2>
            <p className="mt-1 text-sm text-slate-500">
              Một đề ngẫu nhiên, đáp án xáo trộn, làm trong 30 phút. Kết quả chỉ hiện sau khi nộp bài.
            </p>
          </Link>

          <Link href="/leaderboard" className="card transition hover:shadow-md hover:ring-brand-300">
            <div className="mb-2 text-3xl">🏆</div>
            <h2 className="text-lg font-semibold text-slate-900">Bảng xếp hạng</h2>
            <p className="mt-1 text-sm text-slate-500">
              Xem điểm số cao nhất của các lượt thi thật từ tất cả người dùng.
            </p>
          </Link>
        </section>
      )}
    </div>
  );
}
