import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import type { WorkReportWithEmployee } from "@/lib/types";

export const dynamic = "force-dynamic";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || currentMonth();
  const employeeId = params.employee || "";

  const supabase = createSupabaseServerClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const startDate = `${month}-01`;
  const endDateObj = new Date(`${startDate}T00:00:00Z`);
  endDateObj.setUTCMonth(endDateObj.getUTCMonth() + 1);
  const endDate = endDateObj.toISOString().slice(0, 10);

  let query = supabase
    .from("work_reports")
    .select("*, employees(id, name)")
    .gte("work_date", startDate)
    .lt("work_date", endDate)
    .order("work_date", { ascending: false });

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data: reports } = await query;

  return (
    <PageContainer>
      <PageTitle title="日報一覧" />

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
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">従業員</label>
          <select
            name="employee"
            defaultValue={employeeId}
            className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-lg"
          >
            <option value="">全員</option>
            {(employees ?? []).map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-lg font-bold text-white"
        >
          絞り込み
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {(reports ?? []).length === 0 && (
          <p className="text-center text-slate-500">該当する日報がありません</p>
        )}
        {((reports ?? []) as WorkReportWithEmployee[]).map((report) => (
          <Link
            key={report.id}
            href={`/admin/reports/${report.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm active:bg-blue-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{report.work_date}</span>
              <span className="text-sm text-slate-500">{report.employees?.name}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span>伝票番号：{report.slip_no}</span>
              <span className="font-bold">{Number(report.work_hours).toFixed(2)} 時間</span>
            </div>
            {report.remarks && (
              <p className="mt-1 truncate text-sm text-slate-500">{report.remarks}</p>
            )}
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
