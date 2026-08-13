import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Dùng trong Server Components, Route Handlers, Server Actions.
// Đọc/ghi cookie phiên đăng nhập của người dùng hiện tại (tôn trọng RLS).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Được gọi từ Server Component (không có quyền set cookie) — bỏ qua,
            // middleware.ts sẽ lo việc làm mới phiên đăng nhập.
          }
        },
      },
    }
  );
}
