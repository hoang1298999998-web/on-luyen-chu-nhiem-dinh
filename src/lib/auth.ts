import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Helper dùng trong Server Components / Route Handlers để lấy hồ sơ
// (kèm role) của người dùng đang đăng nhập. Trả về null nếu chưa đăng nhập.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}
