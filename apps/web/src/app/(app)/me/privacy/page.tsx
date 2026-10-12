import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { revokeAiConsentsAction, savePrivacyAction } from "./actions";

export default async function MePrivacyPage({
  searchParams,
}: {
  searchParams?: Promise<{ ai?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();
  const sp = searchParams ? await searchParams : {};

  const [{ data: profile }, { data: aiConsents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("discovery_opt_in, hidden_from_discovery")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("ai_consents")
      .select("purpose, granted, granted_at, revoked_at")
      .eq("user_id", user.id)
      .order("purpose"),
  ]);

  const activeAi = (aiConsents ?? []).filter((c) => c.granted);

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("profile.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("profile.privacy")}
      </h1>
      <form
        action={savePrivacyAction}
        className="mt-6 space-y-4 rounded-[20px] border border-dm-line bg-dm-panel p-6 shadow-dm"
      >
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

      <section className="mt-8 space-y-3 rounded-[20px] border border-dm-line bg-dm-surface p-6">
        <h2 className="font-display text-xl font-semibold text-dm-ink">
          {t("profile.aiConsentTitle")}
        </h2>
        <p className="text-sm opacity-70">{t("profile.aiConsentHint")}</p>
        {sp.ai === "revoked" ? (
          <p className="text-sm text-[var(--dm-primary)]">
            {t("profile.aiConsentRevoked")}
          </p>
        ) : null}
        {activeAi.length === 0 ? (
          <p className="text-sm opacity-60">{t("profile.aiConsentNone")}</p>
        ) : (
          <ul className="list-inside list-disc text-sm">
            {activeAi.map((c) => (
              <li key={c.purpose}>{c.purpose}</li>
            ))}
          </ul>
        )}
        <form action={revokeAiConsentsAction}>
          <button
            type="submit"
            className="rounded-full border border-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--dm-primary)]"
            disabled={activeAi.length === 0}
          >
            {t("profile.aiConsentRevoke")}
          </button>
        </form>
      </section>
    </main>
  );
}
