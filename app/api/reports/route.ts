import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
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

  const supabase = createSupabaseAnonClient();

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, is_active")
    .eq("id", employee_id)
    .single();

  if (employeeError || !employee || !employee.is_active) {
    return NextResponse.json({ error: "従業員が見つかりません" }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("work_reports").insert({
    employee_id,
    work_date,
    slip_no,
    work_hours: hours,
    remarks: typeof remarks === "string" && remarks.trim() !== "" ? remarks.trim() : null,
  });

  if (insertError) {
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
