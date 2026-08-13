import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="rounded-md bg-brand-600 px-2 py-1 text-sm text-white">BTCB</span>
          <span className="hidden sm:inline">Ôn luyện thi 2026</span>
        </Link>

        {profile && (
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/practice" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Ôn luyện
            </Link>
            <Link href="/exam" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Thi thật
            </Link>
            <Link href="/leaderboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Bảng xếp hạng
            </Link>
            {profile.role === "admin" && (
              <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Quản trị
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">
                Xin chào, <span className="font-medium text-slate-800">{profile.full_name}</span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn-primary">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {profile && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1 md:hidden">
          <Link href="/practice" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Ôn luyện
          </Link>
          <Link href="/exam" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Thi thật
          </Link>
          <Link href="/leaderboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Xếp hạng
          </Link>
          {profile.role === "admin" && (
            <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Quản trị
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
