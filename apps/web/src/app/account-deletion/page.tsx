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
    description: "How to delete your DeepMatch account",
  };
}

export default async function AccountDeletionPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-dm-ink">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.deleteTitle")}
      </h1>
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
        <a className="text-dm-primary underline" href="mailto:leekyengah@gmail.com">
          leekyengah@gmail.com
        </a>
      </p>
      <Link href="/privacy" className="mt-8 inline-block text-sm text-dm-primary">
        {t("legal.deletePrivacyLink")}
      </Link>
      <p className="mt-6 text-xs text-dm-muted">{t("legal.humanReview")}</p>
    </main>
  );
}
