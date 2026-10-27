import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { DeepProfileForm } from "@/components/me/DeepProfileForm";

export default async function MeDeepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const { data: profile } = await supabase
    .from("profiles")
    .select("fuzzy_region, discovery_opt_in")
    .eq("id", user.id)
    .maybeSingle();
  const { data: deep } = await supabase
    .from("profile_deep")
    .select("goals, values, interests, communication_style, expectations, dealbreakers")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: prefs } = await supabase
    .from("match_preferences")
    .select("min_age, max_age, regions, required_goals")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("profile.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("profile.deepHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("profile.deepIntro")}</p>
      <div className="mt-8">
        <DeepProfileForm
          initial={{
            fuzzy_region: profile?.fuzzy_region ?? "",
            discovery_opt_in: Boolean(profile?.discovery_opt_in),
            goals: (deep?.goals ?? []).join(", "),
            values: (deep?.values ?? []).join(", "),
            interests: (deep?.interests ?? []).join(", "),
            communication_style: deep?.communication_style ?? "",
            expectations: deep?.expectations ?? "",
            dealbreakers: (deep?.dealbreakers ?? []).join(", "),
            min_age: prefs?.min_age ?? 18,
            max_age: prefs?.max_age ?? 99,
            regions: (prefs?.regions ?? []).join(", "),
          }}
        />
      </div>
    </div>
  );
}
