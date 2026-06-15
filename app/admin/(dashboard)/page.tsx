import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { LinkButton } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <PageTitle title="管理者ダッシュボード" />

      <div className="flex flex-col gap-3">
        <LinkButton href="/admin/reports">日報一覧</LinkButton>
        <LinkButton href="/admin/summary" variant="secondary">
          月次集計
        </LinkButton>
        <LinkButton href="/admin/csv" variant="secondary">
          CSV出力
        </LinkButton>
        <LinkButton href="/admin/employees" variant="outline">
          従業員管理
        </LinkButton>
      </div>
    </PageContainer>
  );
}
