import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
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
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("couple.map")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("couple.mapIntro")}</p>
      <div className="mt-8">
        <CoupleMapClient coupleId={coupleId} />
      </div>
    </div>
  );
}
