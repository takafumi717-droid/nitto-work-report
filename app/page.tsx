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
          <div key={employee.id} className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="mb-2 text-center text-lg font-bold text-slate-800">{employee.name}</p>
            <div className="flex gap-2">
              <Link
                href={`/report/new?employee=${employee.id}`}
                className="flex-1 rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-bold text-white active:bg-blue-700"
              >
                日報を入力
              </Link>
              <Link
                href={`/report/mine?employee=${employee.id}`}
                className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-center text-sm font-bold text-slate-700 active:bg-slate-100"
              >
                確認・修正
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Link href="/admin/login" className="text-sm text-slate-400 underline">
          管理者ログイン
        </Link>
      </div>
    </PageContainer>
  );
}
