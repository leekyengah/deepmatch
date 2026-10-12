import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { savePrivacyAction } from "./actions";

export default async function MePrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const { data: profile } = await supabase
    .from("profiles")
    .select("discovery_opt_in, hidden_from_discovery")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("profile.privacy")}</h1>
      <form action={savePrivacyAction} className="mt-6 space-y-4 rounded-3xl bg-white/80 p-6">
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            name="discovery_opt_in"
            defaultChecked={Boolean(profile?.discovery_opt_in)}
          />
          {t("profile.discoveryOptIn")}
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            name="hidden_from_discovery"
            defaultChecked={Boolean(profile?.hidden_from_discovery)}
          />
          {t("profile.hideFromDiscovery")}
        </label>
        <p className="text-xs opacity-60">{t("profile.privacyHint")}</p>
        <button
          type="submit"
          className="rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t("profile.save")}
        </button>
      </form>
    </main>
  );
}
