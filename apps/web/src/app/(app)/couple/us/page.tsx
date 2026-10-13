import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCouple } from "@/lib/couple";
import { getServerTranslator } from "@/lib/i18n/server";
import { CoupleUsClient } from "@/components/couple/CoupleUsClient";

export default async function CoupleUsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const couple = await getActiveCouple(user.id);
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("couple.us")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("couple.usPageIntro")}</p>
      <div className="mt-8">
        <CoupleUsClient
          coupleId={couple?.id ?? null}
          initial={
            couple
              ? {
                  space_title: couple.space_title,
                  motto: couple.motto,
                  started_on: couple.started_on,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
