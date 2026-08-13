import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionOption } from "@/lib/types";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin.from("questions").select("*").eq("id", params.id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });

  return NextResponse.json({ question: data });
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
  const { data, error } = await admin
    .from("questions")
    .update({ content, options, correct_option_id: correctOptionId, source })
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });

  return NextResponse.json({ question: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { error } = await admin.from("questions").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
