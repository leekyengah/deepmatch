import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveHomeState, type HomeState } from "@/lib/home-state";
import { logoutAction } from "@/app/logout/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function stateLabelKey(state: HomeState): string {
  switch (state) {
    case "onboarding":
      return "profile.dashStateOnboarding";
    case "matched":
      return "profile.dashStateMatched";
    case "couple":
      return "profile.dashStateCouple";
    case "suspended":
      return "profile.dashStateSuspended";
    case "dating":
    default:
      return "profile.dashStateDating";
  }
}

function ctaLabelKey(state: HomeState): string {
  switch (state) {
    case "onboarding":
      return "profile.dashCtaOnboarding";
    case "matched":
      return "profile.dashCtaChat";
    case "couple":
      return "profile.dashCtaCouple";
    case "suspended":
      return "profile.dashCtaAccount";
    default:
      return "profile.dashCtaDiscover";
  }
}

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const [{ data: profile }, { data: roleRow }, home] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, mode, discovery_opt_in, fuzzy_region, avatar_path")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle(),
    resolveHomeState(user.id),
  ]);

  const isStaff =
    user.email?.toLowerCase() === "leekyengah@gmail.com" ||
    roleRow?.role === "owner" ||
    roleRow?.role === "admin";
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://deepmatch-admin.vercel.app";

  const name =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    t("nav.avatarMe");

  const journeys: Array<{
    href: string;
    title: string;
    body: string;
  }> = [
    {
      href: "/discover",
      title: t("profile.dashJourneyFind"),
      body: t("profile.dashJourneyFindBody"),
    },
    {
      href: home.coupleId ? "/couple" : "/couple/invite",
      title: t("profile.dashJourneyCouple"),
      body: t("profile.dashJourneyCoupleBody"),
    },
    {
      href: "/services",
      title: t("profile.dashJourneyCompanion"),
      body: t("profile.dashJourneyCompanionBody"),
    },
    {
      href: "/chat",
      title: t("profile.dashJourneyMessages"),
      body: t("profile.dashJourneyMessagesBody"),
    },
  ];

  const settings: Array<[string, string]> = [
    [t("profile.edit"), "/me/edit"],
    [t("profile.deep"), "/me/deep"],
    [t("profile.privacy"), "/me/privacy"],
    [t("profile.history"), "/me/history"],
    [t("profile.account"), "/me/account"],
    [t("profile.premiumPlan"), "/me/premium"],
    [t("nav.safe"), "/safe"],
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("profile.eyebrow")}
          </p>
          <div className="mt-4 flex items-start gap-4">
            <Avatar
              label={name.slice(0, 1).toUpperCase()}
              className="h-16 w-16 shrink-0 text-lg"
            />
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-dm-ink md:text-4xl">
                {t("profile.dashGreeting", { name })}
              </h1>
              <p className="mt-2 max-w-xl font-editorial text-sm leading-relaxed text-dm-muted md:text-base">
                {t("profile.dashSupport")}
              </p>
              {profile?.fuzzy_region ? (
                <p className="mt-2 text-xs text-dm-muted">
                  {profile.fuzzy_region}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="default">{t(stateLabelKey(home.state))}</Badge>
            <Badge tone={profile?.discovery_opt_in ? "good" : "warn"}>
              {profile?.discovery_opt_in
                ? t("profile.discoveryOn")
                : t("profile.discoveryOff")}
            </Badge>
          </div>
        </div>

        <Card className="border-dm-line bg-dm-panel">
          <p className="text-xs font-extrabold uppercase tracking-[1.6px] text-dm-champagne">
            {t("profile.dashNextAction")}
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-dm-ink">
            {t(ctaLabelKey(home.state))}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={home.redirectTo}>
              <Button type="button">{t(ctaLabelKey(home.state))}</Button>
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                {t("auth.logout")}
              </Button>
            </form>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {journeys.map((j) => (
            <Link key={j.href} href={j.href} className="group block h-full">
              <Card className="flex h-full flex-col justify-between transition hover:border-dm-primary">
                <div>
                  <h2 className="font-display text-xl font-semibold text-dm-ink">
                    {j.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-dm-muted">
                    {j.body}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-dm-line text-dm-champagne transition group-hover:border-dm-primary group-hover:text-dm-primary"
                >
                  →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {t("profile.dashSettingsTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-dm-muted">
          {t("profile.dashSettingsHint")}
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {settings.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center justify-between rounded-dm border border-dm-line bg-dm-surface px-4 py-3 text-sm font-semibold text-dm-ink transition hover:border-dm-primary hover:text-dm-primary"
              >
                <span>{label}</span>
                <span aria-hidden className="text-dm-champagne">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {isStaff ? (
        <p className="mt-10 text-xs text-dm-muted">
          <a
            href={adminUrl}
            className="underline underline-offset-2 hover:text-dm-primary"
            rel="noreferrer"
          >
            {t("profile.adminCard")}
          </a>
        </p>
      ) : null}
    </div>
  );
}
