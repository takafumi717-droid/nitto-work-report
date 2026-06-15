import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { ReportEditForm } from "@/components/ReportEditForm";
import type { WorkReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminReportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: report } = await supabase
    .from("work_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) {
    notFound();
  }

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <PageContainer>
      <PageTitle title="日報編集" />
      <ReportEditForm report={report as WorkReport} employees={employees ?? []} />
    </PageContainer>
  );
}
