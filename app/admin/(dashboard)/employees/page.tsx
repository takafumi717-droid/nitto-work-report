import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { LinkButton } from "@/components/ui/Button";
import { toggleActive, moveOrder } from "./actions";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = createSupabaseServerClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <PageContainer>
      <PageTitle title="従業員管理" />

      <LinkButton href="/admin/employees/new">従業員を追加</LinkButton>

      <div className="flex flex-col gap-2">
        {((employees ?? []) as Employee[]).map((emp, i) => (
          <div key={emp.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold">{emp.name}</span>
              <div className="flex gap-1 text-xs">
                {emp.is_admin && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 font-bold text-blue-700">
                    管理者
                  </span>
                )}
                {!emp.is_active && (
                  <span className="rounded-full bg-slate-200 px-2 py-1 font-bold text-slate-600">
                    退職
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <form action={moveOrder.bind(null, emp.id, "up")}>
                <button
                  type="submit"
                  disabled={i === 0}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold disabled:text-slate-300"
                >
                  ↑ 上へ
                </button>
              </form>
              <form action={moveOrder.bind(null, emp.id, "down")}>
                <button
                  type="submit"
                  disabled={i === (employees?.length ?? 0) - 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold disabled:text-slate-300"
                >
                  ↓ 下へ
                </button>
              </form>
              <Link
                href={`/admin/employees/${emp.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
              >
                編集
              </Link>
              <form action={toggleActive.bind(null, emp.id, emp.is_active)}>
                <button
                  type="submit"
                  className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                    emp.is_active
                      ? "border-red-300 text-red-600"
                      : "border-green-300 text-green-600"
                  }`}
                >
                  {emp.is_active ? "退職にする" : "在籍に戻す"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
