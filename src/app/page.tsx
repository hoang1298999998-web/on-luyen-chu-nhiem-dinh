import Link from "next/link";
import { BookIcon, PencilIcon, ChartIcon } from "@/components/Icon";
import { QUESTIONS } from "@/data/questions";

export default function HomePage() {
  const totalQuestions = QUESTIONS.length;

  return (
    <div className="flex flex-col gap-10">
      <section className="card relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gold-400/10" aria-hidden="true" />
        <div className="absolute -bottom-20 right-16 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative">
          <span className="inline-block rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-300">
            Kỳ thi 2026
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Ôn luyện &amp; thi thử BTCB 2026</h1>
          <p className="mt-2 max-w-2xl text-brand-100">
            Luyện tập theo từng bộ 50 câu với phản hồi đúng/sai ngay lập tức, hoặc làm một đề thi thử
            được xáo trộn ngẫu nhiên giống như thi thật. Không cần đăng ký tài khoản, không cần server —
            mọi dữ liệu chạy ngay trong trình duyệt của bạn.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/exam" className="btn bg-gold-400 text-brand-900 hover:bg-gold-300">
              Vào thi thử
            </Link>
            <Link href="/practice" className="btn bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">
              Ôn luyện
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <Link href="/practice" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <BookIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-brand-950">Ôn luyện</h2>
          <p className="mt-1 text-sm text-slate-500">
            Làm từng bộ 50 câu, biết đúng/sai ngay khi chọn đáp án. Hiện có {totalQuestions} câu hỏi
            trong ngân hàng đề.
          </p>
        </Link>

        <Link href="/exam" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <PencilIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-brand-950">Thi thử</h2>
          <p className="mt-1 text-sm text-slate-500">
            Một đề ngẫu nhiên, đáp án xáo trộn, làm trong thời gian giới hạn. Đáp án đúng chỉ hiện sau
            khi nộp bài.
          </p>
        </Link>

        <Link href="/history" className="card transition hover:shadow-card-hover hover:ring-brand-300">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
            <ChartIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-brand-950">Lịch sử làm bài</h2>
          <p className="mt-1 text-sm text-slate-500">
            Xem lại điểm số và đáp án các lượt ôn luyện / thi thử đã làm trên máy này.
          </p>
        </Link>
      </section>
    </div>
  );
}
