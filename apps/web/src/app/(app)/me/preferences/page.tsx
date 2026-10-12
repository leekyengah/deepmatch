import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { PreferencesClient } from "@/components/needs/PreferencesClient";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/preferences");
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto max-w-lg pb-16">
      <Link href="/me/understand" className="text-sm text-dm-muted underline">
        {t("needs.backUnderstand")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("needs.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink">
        {t("needs.prefTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("needs.prefIntro")}</p>
      <div className="mt-6">
        <PreferencesClient />
      </div>
    </main>
  );
}