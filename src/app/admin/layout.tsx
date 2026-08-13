import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirectTo=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <nav className="card flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Tổng quan
          </Link>
          <Link
            href="/admin/questions"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Ngân hàng câu hỏi
          </Link>
          <Link href="/admin/upload" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Nhập từ Excel
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cấu hình đề thi
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
