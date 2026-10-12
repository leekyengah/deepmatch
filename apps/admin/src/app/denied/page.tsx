import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function DeniedPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.deniedTitle")}</h1>
      <p className="mt-3 text-sm text-dm-muted">{t("admin.deniedBody")}</p>
      <Link
        href="/login"
        className="mt-6 text-sm font-semibold text-dm-primary underline"
      >
        {t("admin.deniedOtherAccount")}
      </Link>
    </main>
  );
}
