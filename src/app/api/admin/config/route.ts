import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin.from("exam_config").select("*").eq("id", 1).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });

  const practiceGroupSize = Number(body.practice_group_size);
  const practiceDurationMinutes = Number(body.practice_duration_minutes);
  const examQuestionCount = Number(body.exam_question_count);
  const examDurationMinutes = Number(body.exam_duration_minutes);
  const passPercentage = Number(body.pass_percentage);
  const maxPerSourceRaw = body.max_per_source;
  const maxPerSource =
    maxPerSourceRaw === null || maxPerSourceRaw === "" || maxPerSourceRaw === undefined
      ? null
      : Number(maxPerSourceRaw);

  const fields = [practiceGroupSize, practiceDurationMinutes, examQuestionCount, examDurationMinutes, passPercentage];
  if (fields.some((n) => !Number.isFinite(n) || n <= 0)) {
    return NextResponse.json({ error: "Các giá trị số phải lớn hơn 0." }, { status: 400 });
  }
  if (passPercentage > 100) {
    return NextResponse.json({ error: "Điểm đạt không được vượt quá 100%." }, { status: 400 });
  }
  if (maxPerSource !== null && (!Number.isFinite(maxPerSource) || maxPerSource <= 0)) {
    return NextResponse.json({ error: "Giới hạn số câu theo nguồn phải lớn hơn 0 hoặc để trống." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("exam_config")
    .update({
      practice_group_size: practiceGroupSize,
      practice_duration_minutes: practiceDurationMinutes,
      exam_question_count: examQuestionCount,
      exam_duration_minutes: examDurationMinutes,
      pass_percentage: passPercentage,
      max_per_source: maxPerSource,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data });
}
