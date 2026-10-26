import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveHomeState, type HomeState } from "@/lib/home-state";
import { logoutAction } from "@/app/logout/actions";
import { Button } from "@/components/ui/Button";
import { MemberCenter } from "@/components/me/MemberCenter";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend } from "@/lib/media/limits";

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

function journeyFromState(state: HomeState): { step: number; total: number } {
  const total = 6;
  switch (state) {
    case "onboarding":
      return { step: 1, total };
    case "dating":
      return { step: 2, total };
    case "matched":
      return { step: 4, total };
    case "couple":
      return { step: 5, total };
    case "suspended":
      return { step: 1, total };
    default:
      return { step: 2, total };
  }
}

function ageYears(birthDateIso: string | null | undefined): number | null {
  if (!birthDateIso) return null;
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  return (
    now.getFullYear() -
    birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0)
  );
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

  const [
    { data: profile },
    { data: roleRow },
    { data: entitlements },
    home,
    { count: matchCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, mode, discovery_opt_in, fuzzy_region, avatar_path, bio, birth_date",
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
    supabase
      .from("mutual_matches")
      .select("id", { count: "exact", head: true })
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
  ]);

  const { data: matchRows } = await supabase
    .from("mutual_matches")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(3);

  const peerIds = (matchRows ?? []).map((m) =>
    m.user_a === user.id ? m.user_b : m.user_a,
  );
  const { data: peers } = peerIds.length
    ? await supabase
        .from("profiles")
        .select("id, avatar_path")
        .in("id", peerIds)
    : { data: [] as { id: string; avatar_path: string | null }[] };

  let upcomingDatesCount = 0;
  const { data: pairRow } = await supabase
    .from("pairs")
    .select("id")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq("status", "active")
    .maybeSingle();
  if (pairRow?.id) {
    const nowIso = new Date().toISOString();
    const { count } = await supabase
      .from("couple_dates")
      .select("id", { count: "exact", head: true })
      .eq("pair_id", pairRow.id)
      .gte("starts_at", nowIso);
    upcomingDatesCount = count ?? 0;
  }

  const backend = getStorageBackend();
  let avatarUrl: string | null = null;
  if (profile?.avatar_path) {
    try {
      avatarUrl = await createSignedReadUrl(profile.avatar_path, backend, 600);
    } catch {
      avatarUrl = null;
    }
  }

  const matchPreviewUrls: string[] = [];
  for (const peer of peers ?? []) {
    const path = peer.avatar_path;
    if (!path) continue;
    try {
      const url = await createSignedReadUrl(path, backend, 600);
      if (url) matchPreviewUrls.push(url);
    } catch {
      /* skip */
    }
  }

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
    ? entitlements?.[0]?.package_code?.trim() ||
      t("profile.memberCenter.tierPlus")
    : t("profile.memberCenter.tierExplorer");

  const journey = journeyFromState(home.state);
  const connections = matchCount ?? 0;

  return (
    <MemberCenter
      displayName={name}
      location={profile?.fuzzy_region ?? null}
      headline={profile?.bio ?? null}
      age={ageYears(profile?.birth_date)}
      avatarUrl={avatarUrl}
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
      connectionsCount={connections}
      upcomingDatesCount={upcomingDatesCount}
      matchesActive={connections}
      journeyStep={journey.step}
      journeyTotal={journey.total}
      matchPreviewUrls={matchPreviewUrls}
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
