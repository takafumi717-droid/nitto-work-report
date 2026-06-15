import Link from "next/link";
import { createSupabaseAnonClient } from "@/lib/supabaseClient";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";

export const dynamic = "force-dynamic";

export default async function TopPage() {
  const supabase = createSupabaseAnonClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("is_active", true)
    .eq("is_admin", false)
    .order("sort_order", { ascending: true });

  return (
    <PageContainer>
      <PageTitle title="作業日報" subtitle="氏名を選択してください" />

      <div className="flex flex-col gap-3">
        {(employees ?? []).map((employee) => (
          <Link
            key={employee.id}
            href={`/report/new?employee=${employee.id}`}
            className="block w-full rounded-2xl bg-white px-4 py-4 text-center text-lg font-bold text-slate-800 shadow-sm active:bg-blue-50"
          >
            {employee.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/admin/login" className="text-sm text-slate-400 underline">
          管理者ログイン
        </Link>
      </div>
    </PageContainer>
  );
}
