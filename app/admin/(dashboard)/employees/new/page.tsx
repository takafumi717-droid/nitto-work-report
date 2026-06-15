import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { createEmployee } from "../actions";

export default function NewEmployeePage() {
  return (
    <PageContainer>
      <PageTitle title="従業員追加" />

      <form action={createEmployee} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">氏名</label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm"
        >
          追加する
        </button>
      </form>
    </PageContainer>
  );
}
