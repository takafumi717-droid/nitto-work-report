import Link from "next/link";
import { createSupabaseAnonClient } from "@/lib/supabaseClient";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import type { WorkReport } from "@/lib/types";

export const dynamic = "force-dynamic";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

export default async function MyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; month?: string }>;
}) {
  const { employee, month: monthParam } = await searchParams;
  const supabase = createSupabaseAnonClient();

  if (!employee) {
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name")
      .eq("is_active", true)
      .eq("is_admin", false)
      .order("sort_order", { ascending: true });

    return (
      <PageContainer>
        <PageTitle title="日報の確認・修正" subtitle="氏名を選択してください" />

        <div className="flex flex-col gap-3">
          {(employees ?? []).map((emp) => (
            <Link
              key={emp.id}
              href={`/report/mine?employee=${emp.id}`}
              className="block w-full rounded-2xl bg-white px-4 py-4 text-center text-lg font-bold text-slate-800 shadow-sm active:bg-blue-50"
            >
              {emp.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 underline">
            トップに戻る
          </Link>
        </div>
      </PageContainer>
    );
  }

  const { data: employeeData } = await supabase
    .from("employees")
    .select("id, name")
    .eq("id", employee)
    .single();

  if (!employeeData) {
    return (
      <PageContainer>
        <PageTitle title="日報の確認・修正" />
        <p className="text-center text-slate-500">従業員が見つかりません</p>
        <div className="mt-6 text-center">
          <Link href="/report/mine" className="text-sm text-slate-400 underline">
            氏名選択に戻る
          </Link>
        </div>
      </PageContainer>
    );
  }

  const month = monthParam || currentMonth();
  const startDate = `${month}-01`;
  const endDateObj = new Date(`${startDate}T00:00:00Z`);
  endDateObj.setUTCMonth(endDateObj.getUTCMonth() + 1);
  const endDate = endDateObj.toISOString().slice(0, 10);

  const { data: reports } = await supabase
    .from("work_reports")
    .select("*")
    .eq("employee_id", employee)
    .gte("work_date", startDate)
    .lt("work_date", endDate)
    .order("work_date", { ascending: false });

  const reportList = (reports ?? []) as WorkReport[];
  const totalHours = reportList.reduce((sum, r) => sum + Number(r.work_hours), 0);

  const bySlip = new Map<string, { count: number; totalHours: number }>();
  for (const r of reportList) {
    const entry = bySlip.get(r.slip_no) ?? { count: 0, totalHours: 0 };
    entry.count += 1;
    entry.totalHours += Number(r.work_hours);
    bySlip.set(r.slip_no, entry);
  }
  const slipSummary = Array.from(bySlip.entries())
    .map(([slipNo, v]) => ({ slipNo, ...v }))
    .sort((a, b) => a.slipNo.localeCompare(b.slipNo));

  return (
    <PageContainer>
      <PageTitle title="日報の確認・修正" subtitle={`${employeeData.name} さん`} />

      <form method="get" className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input type="hidden" name="employee" value={employee} />
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">対象月</label>
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-lg"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-lg font-bold text-white"
        >
          表示
        </button>
      </form>

      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-slate-500">合計作業時間</p>
        <p className="text-2xl font-bold">{totalHours.toFixed(2)} 時間</p>
      </div>

      {slipSummary.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-3 py-2">伝票番号</th>
                <th className="px-3 py-2 text-right">件数</th>
                <th className="px-3 py-2 text-right">合計時間</th>
              </tr>
            </thead>
            <tbody>
              {slipSummary.map((s) => (
                <tr key={s.slipNo} className="border-b border-slate-100">
                  <td className="px-3 py-2">{s.slipNo}</td>
                  <td className="px-3 py-2 text-right">{s.count}</td>
                  <td className="px-3 py-2 text-right font-bold">{s.totalHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reportList.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-center text-slate-500 shadow-sm">
            該当する日報がありません
          </p>
        )}
        {reportList.map((r) => (
          <Link
            key={r.id}
            href={`/report/mine/${r.id}?employee=${employee}&month=${month}`}
            className="block rounded-2xl bg-white p-4 shadow-sm active:bg-blue-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{r.work_date}</span>
              <span className="text-sm text-slate-500">伝票 {r.slip_no}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-slate-500">{r.remarks || "（備考なし）"}</span>
              <span className="font-bold">{Number(r.work_hours).toFixed(2)} 時間</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/report/mine" className="text-sm text-slate-400 underline">
          氏名選択に戻る
        </Link>
      </div>
    </PageContainer>
  );
}
