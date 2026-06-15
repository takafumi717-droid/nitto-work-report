import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { PinLoginForm } from "@/components/PinLoginForm";

export default function AdminLoginPage() {
  return (
    <PageContainer className="justify-center">
      <PageTitle title="管理者ログイン" subtitle="4桁のPINを入力してください" />
      <PinLoginForm />
    </PageContainer>
  );
}
