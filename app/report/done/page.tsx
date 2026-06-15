import { PageContainer } from "@/components/ui/PageContainer";
import { LinkButton } from "@/components/ui/Button";

export default function ReportDonePage() {
  return (
    <PageContainer className="items-center justify-center text-center">
      <div className="text-6xl">✅</div>
      <h1 className="text-2xl font-bold">登録しました</h1>
      <p className="text-slate-500">お疲れさまでした。</p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <LinkButton href="/" variant="primary">
          もう一件入力する
        </LinkButton>
        <LinkButton href="/" variant="outline">
          トップに戻る
        </LinkButton>
      </div>
    </PageContainer>
  );
}
