import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ CHỈ dùng bên trong Route Handlers (src/app/api/**/route.ts).
// Dùng service_role key nên BỎ QUA toàn bộ Row Level Security.
// Không bao giờ import file này vào Client Component hoặc gửi key này ra trình duyệt.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
