import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { saveModeAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/" className="text-sm text-dm-muted">
        {t("auth.backHome")}
      </Link>
      <h1 className="mt-6 font-display text-4xl text-dm-raspberry">
        {t("onboarding.chooseJourney")}
      </h1>
      <p className="mt-3 text-sm text-dm-muted">{t("onboarding.partnerNote")}</p>
      <form
        action={saveModeAction}
        className="mt-8 space-y-5 rounded-dm-xl border border-dm-line bg-dm-panel p-6 shadow-dm"
      >
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-dm-raspberry">
            {t("onboarding.modeLegend")}
          </legend>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="solo" defaultChecked />
            {t("onboarding.modeSolo")}
          </label>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="has_partner" />
            {t("onboarding.modePartner")}
          </label>
        </fieldset>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("onboarding.fuzzyRegion")}
          <Input
            name="fuzzy_region"
            className="mt-1"
            placeholder={t("onboarding.fuzzyRegionPlaceholder")}
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="discovery_opt_in"
            defaultChecked
            className="mt-1"
          />
          <span>{t("onboarding.discoveryOptIn")}</span>
        </label>

        <Button type="submit">{t("onboarding.continue")}</Button>
      </form>
    </main>
  );
}
