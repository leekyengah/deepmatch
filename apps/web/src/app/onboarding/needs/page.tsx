import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { NeedsRunnerClient } from "@/components/needs/NeedsRunnerClient";

export default async function OnboardingNeedsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const { t } = await getServerTranslator();

  const { data: profile } = await supabase
    .from("profiles")
    .select("mode, discovery_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  const finishHref =
    profile?.mode === "has_partner"
      ? "/couple/invite"
      : profile?.discovery_opt_in
        ? "/discover"
        : "/me";

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/onboarding" className="text-sm text-dm-muted">
        {t("auth.backHome")}
      </Link>
      <p className="mt-6 text-xs font-bold tracking-[0.18em] text-dm-champagne">
        {t("onboarding.needsProgress")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("onboarding.needsTitle")}
      </h1>
      <p className="mt-3 font-editorial text-sm text-dm-muted">
        {t("onboarding.needsHint")}
      </p>
      <div className="mt-8">
        <NeedsRunnerClient
          preset="onboarding"
          finishHref={finishHref}
          showReview
        />
      </div>
      <p className="mt-6 text-center text-xs text-dm-muted">
        <Link href={finishHref} className="underline">
          {t("onboarding.needsSkip")}
        </Link>
      </p>
    </main>
  );
}
