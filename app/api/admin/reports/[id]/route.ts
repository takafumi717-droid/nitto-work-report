import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  const { employee_id, work_date, slip_no, work_hours, remarks } = body;

  if (!employee_id || typeof employee_id !== "string") {
    return NextResponse.json({ error: "氏名を選択してください" }, { status: 400 });
  }
  if (!work_date || typeof work_date !== "string") {
    return NextResponse.json({ error: "作業日を入力してください" }, { status: 400 });
  }
  if (typeof slip_no !== "string" || !/^\d{5}$/.test(slip_no)) {
    return NextResponse.json(
      { error: "作業伝票番号は数字5桁で入力してください" },
      { status: 400 }
    );
  }
  const hours = Number(work_hours);
  if (!hours || hours <= 0 || Math.round(hours * 4) !== hours * 4) {
    return NextResponse.json(
      { error: "作業時間は0.25時間単位で入力してください" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  const { data: before, error: fetchError } = await supabase
    .from("work_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !before) {
    return NextResponse.json({ error: "日報が見つかりません" }, { status: 404 });
  }

  const after = {
    employee_id,
    work_date,
    slip_no,
    work_hours: hours,
    remarks: typeof remarks === "string" && remarks.trim() !== "" ? remarks.trim() : null,
  };

  const { error: updateError } = await supabase
    .from("work_reports")
    .update({ ...after, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  await supabase.from("report_edits").insert({
    work_report_id: id,
    edited_by: admin.id,
    before_data: before,
    after_data: { ...before, ...after },
  });

  return NextResponse.json({ ok: true });
}
