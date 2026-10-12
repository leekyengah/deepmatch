import Link from "next/link";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return { title: t("legal.privacyMetaTitle") };
}

export default async function PrivacyPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.privacyTitle")}
      </h1>
      <p className="mt-4 text-sm text-dm-muted">
        {t("legal.updated", { date: "12/10/2026" })}
      </p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-dm-ink/90">
        <p>{t("legal.privacyP1")}</p>
        <p>{t("legal.privacyP2")}</p>
        <p>{t("legal.privacyP3")}</p>
        <p>{t("legal.contact", { email: "leekyengah@gmail.com" })}</p>
        <p className="text-xs text-dm-muted">{t("legal.humanReview")}</p>
      </div>
      <p className="mt-10">
        <Link href="/" className="text-sm text-dm-primary underline">
          {t("legal.backHome")}
        </Link>
      </p>
    </main>
  );
}
