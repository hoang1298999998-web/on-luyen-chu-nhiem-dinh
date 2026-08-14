import Link from "next/link";

export default function Navbar() {
  const navLinkClass =
    "rounded-lg px-3 py-2 text-sm font-medium text-brand-100/80 transition hover:bg-white/10 hover:text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-gold-400/30 bg-brand-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-display font-extrabold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 text-sm font-extrabold text-brand-900">
            BT
          </span>
          <span className="hidden text-[15px] leading-tight sm:inline">
            Ôn luyện thi BTCB
            <span className="block text-xs font-medium text-gold-300">2026</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/practice" className={navLinkClass}>
            Ôn luyện
          </Link>
          <Link href="/exam" className={navLinkClass}>
            Thi thử
          </Link>
          <Link href="/history" className={navLinkClass}>
            Lịch sử
          </Link>
        </nav>
      </div>
    </header>
  );
}
