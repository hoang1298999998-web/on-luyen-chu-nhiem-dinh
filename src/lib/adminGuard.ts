import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Dùng ở đầu mỗi Route Handler dưới /api/admin/**.
// Trả về { profile } nếu là admin, hoặc { error: NextResponse } để return thẳng ra ngoài.
export async function requireAdmin(): Promise<{ profile: Profile } | { error: NextResponse }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile || (profile as Profile).role !== "admin") {
    return { error: NextResponse.json({ error: "Bạn không có quyền truy cập chức năng này." }, { status: 403 }) };
  }

  return { profile: profile as Profile };
}
