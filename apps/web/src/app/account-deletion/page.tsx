import Link from "next/link";
import type { Metadata } from "next";
import { deleteAccountAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("legal.deleteMetaTitle"),
    description: "Yêu cầu xóa tài khoản DeepMatch",
  };
}

export default async function AccountDeletionPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-dm-ink">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.deleteTitle")}
      </h1>
      <p className="mt-3 text-sm text-dm-muted">
        Chính sách đầy đủ:{" "}
        <Link href="/legal/delete-account" className="text-dm-primary underline">
          /legal/delete-account
        </Link>
        . Xóa tài khoản không tự hủy thuê bao tại cửa hàng ứng dụng — xem{" "}
        <Link href="/legal/subscriptions" className="text-dm-primary underline">
          Thuê bao & hoàn tiền
        </Link>
        .
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li>{t("legal.deleteStep1")}</li>
        <li>{t("legal.deleteStep2")}</li>
        <li>{t("legal.deleteStep3")}</li>
      </ol>
      <form action={deleteAccountAction} className="mt-8 space-y-3 rounded-dm bg-white/80 p-6">
        <p className="text-sm text-dm-muted">{t("legal.deleteWebPrompt")}</p>
        <Input name="confirm" placeholder="DELETE" required autoComplete="off" />
        <Button type="submit" variant="outline" size="sm">
          {t("legal.deleteConfirmCta")}
        </Button>
      </form>
      <p className="mt-4 text-sm text-dm-muted">
        {t("legal.deleteSupport")}{" "}
        <Link href="/support" className="text-dm-primary underline">
          /support
        </Link>
        . Không gửi mật khẩu, OTP hoặc số thẻ qua hỗ trợ.
      </p>
      <Link href="/legal/privacy" className="mt-8 inline-block text-sm text-dm-primary">
        {t("legal.deletePrivacyLink")}
      </Link>
    </main>
  );
}
