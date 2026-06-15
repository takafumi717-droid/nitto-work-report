import { PageContainer, PageTitle } from "@/components/ui/PageContainer";

function currentMonth() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

export default async function AdminCsvPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || currentMonth();

  return (
    <PageContainer>
      <PageTitle title="CSV出力" subtitle="対象月を選んで出力してください" />

      <form
        method="get"
        action="/api/admin/csv"
        className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
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
          CSVを出力する
        </button>
      </form>
    </PageContainer>
  );
}
