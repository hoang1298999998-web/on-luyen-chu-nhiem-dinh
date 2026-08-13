import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { shuffleArray } from "@/lib/shuffle";
import type { QuestionOption } from "@/lib/types";

// Trả về danh sách câu hỏi (KÈM đáp án đúng) của 1 bộ ôn luyện.
// Ôn luyện được phép lộ đáp án ngay nên không cần giấu qua cơ chế attempt như thi thật.
// Đáp án của mỗi câu được xáo trộn lại mỗi lần gọi API này.
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const groupParam = request.nextUrl.searchParams.get("group");
  const group = Number(groupParam);

  if (!groupParam || !Number.isInteger(group) || group < 1) {
    return NextResponse.json({ error: "Nhóm câu hỏi không hợp lệ." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: config } = await admin
    .from("exam_config")
    .select("practice_group_size, practice_duration_minutes")
    .eq("id", 1)
    .maybeSingle();

  const groupSize = config?.practice_group_size ?? 50;
  const durationMinutes = config?.practice_duration_minutes ?? 30;

  const from = (group - 1) * groupSize;
  const to = from + groupSize - 1;

  const { data: questions, error } = await admin
    .from("questions")
    .select("id, order_index, content, options, correct_option_id, source")
    .order("order_index", { ascending: true })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "Không tìm thấy câu hỏi cho nhóm này." }, { status: 404 });
  }

  const shuffled = questions.map((q) => ({
    id: q.id as string,
    content: q.content as string,
    source: (q.source as string | null) ?? null,
    correct_option_id: q.correct_option_id as string,
    options: shuffleArray(q.options as QuestionOption[]),
  }));

  return NextResponse.json({
    group_no: group,
    duration_seconds: durationMinutes * 60,
    questions: shuffled,
  });
}
