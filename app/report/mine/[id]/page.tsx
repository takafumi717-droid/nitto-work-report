import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAnonClient } from "@/lib/supabaseClient";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { MyReportEditForm } from "@/components/MyReportEditForm";
import type { WorkReport } from "@/lib/types";

export const dynamic = "force-dynamic";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

export default async function MyReportEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ employee?: string; month?: string }>;
}) {
  const { id } = await params;
  const { employee, month } = await searchParams;
  const supabase = createSupabaseAnonClient();

  const { data: report } = await supabase
    .from("work_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) {
    notFound();
  }

  const targetMonth = month || currentMonth();
  const backHref = `/report/mine?employee=${employee ?? report.employee_id}&month=${targetMonth}`;

  if (employee && report.employee_id !== employee) {
    return (
      <PageContainer>
        <PageTitle title="日報の修正" />
        <p className="text-center text-slate-500">この日報は修正できません</p>
        <div className="mt-6 text-center">
          <Link href={backHref} className="text-sm text-slate-400 underline">
            一覧に戻る
          </Link>
        </div>
      </PageContainer>
    );
  }

  const { data: employeeData } = await supabase
    .from("employees")
    .select("id, name")
    .eq("id", report.employee_id)
    .single();

  return (
    <PageContainer>
      <PageTitle title="日報の修正" />
      <MyReportEditForm
        report={report as WorkReport}
        employeeName={employeeData?.name ?? ""}
        month={targetMonth}
      />
      <div className="mt-2 text-center">
        <Link href={backHref} className="text-sm text-slate-400 underline">
          一覧に戻る
        </Link>
      </div>
    </PageContainer>
  );
}
