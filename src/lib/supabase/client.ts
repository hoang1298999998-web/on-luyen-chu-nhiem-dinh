"use client";

import { createBrowserClient } from "@supabase/ssr";

// Dùng trong Client Components. Tự động đính kèm cookie phiên đăng nhập.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
