import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { CoupleAddClient } from "@/components/couple/CoupleAddClient";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CoupleAddPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const coupleId = await getActiveCoupleId(user.id);

  return (
    <div className="max-w-xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("couple.addPageHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("couple.addPageIntro")}
      </p>
      <div className="mt-6">
        <CoupleAddClient coupleId={coupleId} />
      </div>
    </div>
  );
}
