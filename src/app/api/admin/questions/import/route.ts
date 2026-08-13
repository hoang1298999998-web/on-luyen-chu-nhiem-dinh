import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionOption } from "@/lib/types";

type ImportRow = {
  content: string;
  options: QuestionOption[];
  correct_option_id: string;
  source: string | null;
};

function validateRow(row: unknown, index: number): { ok: true; row: ImportRow } | { ok: false; error: string } {
  const r = row as Partial<ImportRow> | null;
  if (!r || typeof r.content !== "string" || r.content.trim().length === 0) {
    return { ok: false, error: `Dòng ${index + 1}: thiếu nội dung câu hỏi.` };
  }
  if (!Array.isArray(r.options) || r.options.length < 2 || r.options.length > 6) {
    return { ok: false, error: `Dòng ${index + 1}: cần 2-6 đáp án.` };
  }
  const validOptions = r.options.every(
    (o) => o && typeof o.id === "string" && typeof o.text === "string" && o.text.trim().length > 0
  );
  if (!validOptions) {
    return { ok: false, error: `Dòng ${index + 1}: có đáp án trống.` };
  }
  if (!r.correct_option_id || !r.options.some((o) => o.id === r.correct_option_id)) {
    return { ok: false, error: `Dòng ${index + 1}: đáp án đúng không khớp với danh sách đáp án.` };
  }
  return {
    ok: true,
    row: {
      content: r.content.trim(),
      options: r.options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correct_option_id: r.correct_option_id,
      source: typeof r.source === "string" && r.source.trim() ? r.source.trim() : null,
    },
  };
}

// Nhập hàng loạt câu hỏi (thường được gọi sau khi admin đã dùng thư viện xlsx
// để đọc file Excel ngay trên trình duyệt và tự kiểm tra sơ bộ ở phía client).
// Route này VẪN kiểm tra lại toàn bộ dữ liệu ở phía server trước khi ghi vào DB.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const rows = body?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Không có dữ liệu để nhập." }, { status: 400 });
  }
  if (rows.length > 2000) {
    return NextResponse.json({ error: "Tối đa 2000 câu hỏi mỗi lần nhập." }, { status: 400 });
  }

  const validRows: ImportRow[] = [];
  const errors: string[] = [];

  rows.forEach((row: unknown, index: number) => {
    const result = validateRow(row, index);
    if (result.ok) validRows.push(result.row);
    else errors.push(result.error);
  });

  if (validRows.length === 0) {
    return NextResponse.json({ error: "Không có dòng nào hợp lệ.", details: errors }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: maxRow } = await admin
    .from("questions")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrderIndex = (maxRow?.order_index ?? 0) + 1;

  const toInsert = validRows.map((row) => ({
    order_index: nextOrderIndex++,
    content: row.content,
    options: row.options,
    correct_option_id: row.correct_option_id,
    source: row.source,
    created_by: auth.profile.id,
  }));

  const { data, error } = await admin.from("questions").insert(toInsert).select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    skipped: errors.length,
    errors,
  });
}
