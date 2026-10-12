import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveHomeState } from "@/lib/home-state";
import { logoutAction } from "@/app/logout/actions";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      .select("display_name, mode, discovery_opt_in, fuzzy_region")
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

  const links: Array<[string, string]> = [
    [t("profile.edit"), "/me/edit"],
    [t("profile.deep"), "/me/deep"],
    [t("profile.privacy"), "/me/privacy"],
    [t("profile.history"), "/me/history"],
    [t("profile.account"), "/me/account"],
    [t("profile.premiumPlan"), "/me/premium"],
    [t("nav.discover"), "/discover"],
    [t("nav.chat"), "/chat"],
    [t("nav.couple"), "/couple"],
    [t("nav.services"), "/services"],
  ];

  const region = profile?.fuzzy_region ? ` · ${profile.fuzzy_region}` : "";

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
            {t("profile.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
            {t("profile.title")}
          </h1>
          <p className="mt-2 text-sm text-dm-muted">
            {t("profile.summary", {
              name: profile?.display_name ?? user.email ?? "",
              mode: profile?.mode ?? "solo",
              region,
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <LanguageSwitcher />
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              {t("auth.logout")}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={profile?.discovery_opt_in ? "good" : "warn"}>
          {profile?.discovery_opt_in
            ? t("profile.discoveryOn")
            : t("profile.discoveryOff")}
        </Badge>
        <Badge tone="default">{home.state}</Badge>
      </div>

      <div className="mt-6">
        <Link href={home.redirectTo}>
          <Button type="button">
            {home.state === "couple"
              ? t("nav.couple")
              : home.state === "matched"
                ? t("nav.chat")
                : home.state === "onboarding"
                  ? t("nav.titles.onboarding")
                  : t("nav.discover")}
          </Button>
        </Link>
      </div>

      <p className="mt-4 text-xs text-dm-muted">{t("common.languageHint")}</p>

      {isStaff ? (
        <div className="mt-6">
          <a href={adminUrl} className="block">
            <Card className="border-dm-primary text-sm font-semibold text-dm-raspberry transition hover:border-dm-primary">
              {t("profile.adminCard")}
            </Card>
          </a>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>
            <Card className="h-full text-sm font-semibold text-dm-raspberry transition hover:border-dm-primary">
              {label}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
