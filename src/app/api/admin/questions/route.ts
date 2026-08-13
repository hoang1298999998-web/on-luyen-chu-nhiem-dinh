import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionOption } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("pageSize") ?? "20")));
  const search = request.nextUrl.searchParams.get("q")?.trim();

  let query = admin
    .from("questions")
    .select("id, order_index, content, options, correct_option_id, source, created_at", { count: "exact" })
    .order("order_index", { ascending: true });

  if (search) {
    query = query.ilike("content", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data ?? [], total: count ?? 0, page, pageSize });
}

function validateOptions(options: unknown): options is QuestionOption[] {
  if (!Array.isArray(options)) return false;
  if (options.length < 2 || options.length > 6) return false;
  return options.every(
    (o) =>
      o &&
      typeof o === "object" &&
      typeof (o as QuestionOption).id === "string" &&
      typeof (o as QuestionOption).text === "string" &&
      (o as QuestionOption).text.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const content: string | undefined = body?.content?.trim();
  const options = body?.options;
  const correctOptionId: string | undefined = body?.correct_option_id;
  const source: string | null = body?.source?.trim() || null;

  if (!content) {
    return NextResponse.json({ error: "Thiếu nội dung câu hỏi." }, { status: 400 });
  }
  if (!validateOptions(options)) {
    return NextResponse.json({ error: "Đáp án không hợp lệ (cần 2-6 đáp án, có nội dung)." }, { status: 400 });
  }
  if (!correctOptionId || !options.some((o: QuestionOption) => o.id === correctOptionId)) {
    return NextResponse.json({ error: "Chưa chọn đáp án đúng hợp lệ." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: maxRow } = await admin
    .from("questions")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = (maxRow?.order_index ?? 0) + 1;

  const { data, error } = await admin
    .from("questions")
    .insert({
      order_index: nextOrderIndex,
      content,
      options,
      correct_option_id: correctOptionId,
      source,
      created_by: auth.profile.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ question: data });
}
