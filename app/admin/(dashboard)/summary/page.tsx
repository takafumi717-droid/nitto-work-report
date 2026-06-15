import { createSupabaseServerClient } from "@/lib/supabase";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";

export const dynamic = "force-dynamic";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

export default async function AdminSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || currentMonth();

  const supabase = createSupabaseServerClient();

  const startDate = `${month}-01`;
  const endDateObj = new Date(`${startDate}T00:00:00Z`);
  endDateObj.setUTCMonth(endDateObj.getUTCMonth() + 1);
  const endDate = endDateObj.toISOString().slice(0, 10);

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { data: reports } = await supabase
    .from("work_reports")
    .select("employee_id, work_hours")
    .gte("work_date", startDate)
    .lt("work_date", endDate);

  const summary = (employees ?? []).map((emp) => {
    const empReports = (reports ?? []).filter((r) => r.employee_id === emp.id);
    const totalHours = empReports.reduce((sum, r) => sum + Number(r.work_hours), 0);
    return { id: emp.id, name: emp.name, count: empReports.length, totalHours };
  });

  const activeSummary = summary.filter((s) => s.count > 0);

  return (
    <PageContainer>
      <PageTitle title="月次集計" />

      <form method="get" className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
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

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-3 py-2">氏名</th>
              <th className="px-3 py-2 text-right">件数</th>
              <th className="px-3 py-2 text-right">合計時間</th>
            </tr>
          </thead>
          <tbody>
            {activeSummary.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                  該当するデータがありません
                </td>
              </tr>
            )}
            {activeSummary.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2 text-right">{s.count}</td>
                <td className="px-3 py-2 text-right font-bold">{s.totalHours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
