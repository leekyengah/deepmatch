import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { saveModeAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const VALUE_KEYS = [
  "valueHonesty",
  "valueFamily",
  "valueGrowth",
  "valueHarmony",
  "valueHealthy",
  "valueHumor",
  "valueIndependence",
  "valueExplore",
  "valueResponsibility",
] as const;

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
      <p className="mt-6 text-xs font-bold tracking-[0.18em] text-dm-champagne">
        {t("onboarding.valuesProgress")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("onboarding.valuesTitle")}
      </h1>
      <p className="mt-3 font-editorial text-sm text-dm-muted">
        {t("onboarding.valuesHint")}
      </p>

      <form
        action={saveModeAction}
        className="mt-8 space-y-6 rounded-dm-xl border border-dm-line bg-dm-panel p-6 shadow-dm"
      >
        <fieldset>
          <legend className="sr-only">{t("onboarding.valuesTitle")}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VALUE_KEYS.map((key) => (
              <label
                key={key}
                className="cursor-pointer rounded-dm border border-dm-line bg-dm-surface px-3 py-3 text-center text-sm font-medium text-dm-ink has-[:checked]:border-dm-primary has-[:checked]:bg-dm-primary has-[:checked]:text-white"
              >
                <input
                  type="checkbox"
                  name="values"
                  value={key}
                  className="sr-only"
                />
                {t(`onboarding.${key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-lg font-semibold text-dm-ink">
            {t("onboarding.intentTitle")}
          </legend>
          <label className="flex cursor-pointer gap-3 rounded-dm border border-dm-line bg-dm-surface p-3 has-[:checked]:border-dm-primary">
            <input
              type="radio"
              name="intent"
              value="long_term"
              defaultChecked
              className="mt-1 accent-[var(--dm-primary)]"
            />
            <span>
              <span className="block text-sm font-semibold">
                {t("onboarding.intentLongTerm")}
              </span>
              <span className="mt-0.5 block text-xs text-dm-muted">
                {t("onboarding.intentLongTermHint")}
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-dm border border-dm-line bg-dm-surface p-3 has-[:checked]:border-dm-primary">
            <input
              type="radio"
              name="intent"
              value="companion"
              className="mt-1 accent-[var(--dm-primary)]"
            />
            <span className="text-sm font-semibold">
              {t("onboarding.intentCompanion")}
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-dm border border-dm-line bg-dm-surface p-3 has-[:checked]:border-dm-primary">
            <input
              type="radio"
              name="intent"
              value="talks"
              className="mt-1 accent-[var(--dm-primary)]"
            />
            <span className="text-sm font-semibold">
              {t("onboarding.intentTalks")}
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-dm-ink">
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

        <label className="block text-sm font-semibold text-dm-ink">
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
            className="mt-1 accent-[var(--dm-primary)]"
          />
          <span>{t("onboarding.discoveryOptIn")}</span>
        </label>

        <Button type="submit" className="w-full">
          {t("onboarding.continue")} →
        </Button>
      </form>
    </main>
  );
}
