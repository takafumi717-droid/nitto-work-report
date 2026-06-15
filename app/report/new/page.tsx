import { createSupabaseAnonClient } from "@/lib/supabaseClient";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { ReportForm } from "@/components/ReportForm";

export const dynamic = "force-dynamic";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>;
}) {
  const { employee } = await searchParams;

  const supabase = createSupabaseAnonClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("is_active", true)
    .or("is_admin.eq.false,can_submit_reports.eq.true")
    .order("sort_order", { ascending: true });

  return (
    <PageContainer>
      <PageTitle title="日報入力" />
      <ReportForm employees={employees ?? []} defaultEmployeeId={employee ?? ""} />
    </PageContainer>
  );
}
