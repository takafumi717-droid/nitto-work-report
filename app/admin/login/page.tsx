import Link from "next/link";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { PinLoginForm } from "@/components/PinLoginForm";

export default function AdminLoginPage() {
  return (
    <PageContainer className="justify-center">
      <PageTitle title="管理者ログイン" subtitle="4桁のPINを入力してください" />
      <PinLoginForm />
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-slate-400 underline">
          トップに戻る
        </Link>
      </div>
    </PageContainer>
  );
}
