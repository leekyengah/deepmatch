import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveHomeState, type HomeState } from "@/lib/home-state";
import { logoutAction } from "@/app/logout/actions";
import { Button } from "@/components/ui/Button";
import { MemberCenter } from "@/components/me/MemberCenter";
import { ME_FIXTURE } from "@/lib/me-fixtures";

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

function estimateProfilePct(input: {
  discovery_opt_in: boolean | null;
  fuzzy_region: string | null;
  bio: string | null;
  hasAvatar: boolean;
  homeState: string;
}): number {
  let pct = 35;
  if (input.discovery_opt_in) pct += 20;
  if (input.fuzzy_region) pct += 15;
  if (input.bio && input.bio.trim().length > 20) pct += 15;
  if (input.hasAvatar) pct += 10;
  if (input.homeState === "matched" || input.homeState === "couple") pct += 5;
  return Math.min(95, pct);
}

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const [{ data: profile }, { data: roleRow }, { data: entitlements }, home] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "display_name, mode, discovery_opt_in, fuzzy_region, avatar_path, bio",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("entitlements")
        .select("id, package_code, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1),
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

  const completionPercent = estimateProfilePct({
    discovery_opt_in: profile?.discovery_opt_in ?? null,
    fuzzy_region: profile?.fuzzy_region ?? null,
    bio: profile?.bio ?? null,
    hasAvatar: Boolean(profile?.avatar_path),
    homeState: home.state,
  });

  const hasEntitlement = Boolean(entitlements?.length);
  const membershipLabel = hasEntitlement
    ? entitlements?.[0]?.package_code?.trim() || ME_FIXTURE.membershipLabel
    : t("profile.memberCenter.tierExplorer");

  return (
    <MemberCenter
      displayName={name}
      location={profile?.fuzzy_region ?? null}
      stateLabel={t(stateLabelKey(home.state))}
      discoveryOn={Boolean(profile?.discovery_opt_in)}
      discoveryOnLabel={t("profile.discoveryOn")}
      discoveryOffLabel={t("profile.discoveryOff")}
      homeState={home.state}
      primaryCtaLabel={t(ctaLabelKey(home.state))}
      primaryHref={home.redirectTo}
      completionPercent={completionPercent}
      hasEntitlement={hasEntitlement}
      membershipLabel={membershipLabel}
      isStaff={isStaff}
      adminUrl={adminUrl}
      staffOpsLabel={t("places.opsVenuesLink")}
      staffAdminLabel={t("profile.adminCard")}
      logoutSlot={
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            {t("auth.logout")}
          </Button>
        </form>
      }
      t={t}
    />
  );
}
