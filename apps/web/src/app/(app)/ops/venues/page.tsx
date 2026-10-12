import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffUser } from "@/lib/staff";
import { getServerTranslator } from "@/lib/i18n/server";
import { VenueModerationClient } from "@/components/ops/VenueModerationClient";

export default async function OpsVenuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/ops/venues");
  if (!(await isStaffUser(supabase, user))) redirect("/me");
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto max-w-3xl pb-16">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("needs.backMe")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("places.opsVenuesTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("places.opsVenuesIntro")}</p>
      <div className="mt-6">
        <VenueModerationClient />
      </div>
    </main>
  );
}
