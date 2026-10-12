import Link from "next/link";
import { redirect } from "next/navigation";
import { NeedsRunnerClient } from "@/components/needs/NeedsRunnerClient";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function UnderstandPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/understand");
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("needs.backMe")}
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("needs.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("needs.title")}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-dm-muted">{t("needs.intro")}</p>
      <div className="mt-8">
        <NeedsRunnerClient />
      </div>
    </div>
  );
}
