import Link from "next/link";
import { BookIcon, PencilIcon, ChartIcon } from "@/components/Icon";

const tabs = [
  { href: "/practice", label: "Ôn luyện", Icon: BookIcon },
  { href: "/exam", label: "Thi thử", Icon: PencilIcon },
  { href: "/history", label: "Lịch sử", Icon: ChartIcon },
];

export default function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Điều hướng chính"
    >
      {tabs.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex min-w-[64px] flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-500 transition hover:text-brand-700 active:text-brand-700"
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
