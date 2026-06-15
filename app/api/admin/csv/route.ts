import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/auth";
import type { WorkReportWithEmployee } from "@/lib/types";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get("month") || currentMonth();

  const startDate = `${month}-01`;
  const endDateObj = new Date(`${startDate}T00:00:00Z`);
  endDateObj.setUTCMonth(endDateObj.getUTCMonth() + 1);
  const endDate = endDateObj.toISOString().slice(0, 10);

  const supabase = createSupabaseServerClient();
  const { data: reports } = await supabase
    .from("work_reports")
    .select("*, employees(id, name)")
    .gte("work_date", startDate)
    .lt("work_date", endDate)
    .order("work_date", { ascending: true });

  const header = ["作業日", "氏名", "作業伝票番号", "作業時間", "備考", "登録日時"];
  const rows = ((reports ?? []) as WorkReportWithEmployee[]).map((r) => [
    r.work_date,
    r.employees?.name ?? "",
    r.slip_no,
    Number(r.work_hours).toFixed(2),
    r.remarks ?? "",
    new Date(r.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
  ]);

  const lines = [header, ...rows].map((row) => row.map((v) => csvEscape(String(v))).join(","));
  const csvBody = lines.join("\r\n");
  const bom = "﻿";

  return new NextResponse(bom + csvBody, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="work_reports_${month}.csv"`,
    },
  });
}
