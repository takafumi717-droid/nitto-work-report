import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { updateEmployee } from "../actions";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (!employee) {
    notFound();
  }

  const emp = employee as Employee;
  const updateAction = updateEmployee.bind(null, emp.id);

  return (
    <PageContainer>
      <PageTitle title="従業員編集" />

      <form action={updateAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">氏名</label>
          <input
            type="text"
            name="name"
            defaultValue={emp.name}
            required
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          />
        </div>

        <label className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
          <input
            type="checkbox"
            name="is_admin"
            defaultChecked={emp.is_admin}
            className="h-5 w-5"
          />
          <span className="font-bold">管理者権限を持つ</span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">
            管理者PIN（4桁、管理者の場合のみ）
          </label>
          <input
            type="text"
            name="admin_pin"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            defaultValue={emp.admin_pin ?? ""}
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg tracking-widest"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm"
        >
          保存する
        </button>
      </form>
    </PageContainer>
  );
}
