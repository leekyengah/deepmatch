import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { CoupleMapClient } from "@/components/couple/CoupleMapClient";

export default async function CoupleMapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getServerTranslator();

  let coupleId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("pairs")
      .select("id")
      .eq("status", "active")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .maybeSingle();
    coupleId = data?.id ?? null;
  }

  return (
    <div className="dm-page-frame dm-page-frame--standard space-y-6">
      <AnalyticsBeacon event="couple_map_view" />
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("couple.mapSanhDoi")}
      </h1>
      <p className="mt-2 font-editorial text-sm text-dm-muted">
        {t("couple.mapIntro")}
      </p>
      <Link
        href="/places/map?city=H%C3%A0%20N%E1%BB%99i&cat=cafe&budget=500000"
        className="inline-flex min-h-touch items-center rounded-full bg-dm-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        {t("places.openDateMapCta")}
      </Link>
      <div className="mt-2">
        <CoupleMapClient coupleId={coupleId} />
      </div>
    </div>
  );
}
