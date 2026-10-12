import { NextResponse } from "next/server";
import { rankCandidates, type DiscoveryProfile, type MatchPreferences } from "@deepmatch/shared";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: Request) {
  const requestId = makeRequestId();
  if (
    !(await flagEnabled("ff_discovery")) ||
    !(await flagEnabled("ff_matching"))
  ) {
    return jsonError("FORBIDDEN", "flagDiscoveryOff", requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const url = new URL(req.url);
  const pageSize = Math.min(Number(url.searchParams.get("page_size") ?? 20), 50);

  const { data: me } = await supabase
    .from("profiles")
    .select(
      "id, display_name, birth_date, fuzzy_region, discovery_opt_in, hidden_from_discovery",
    )
    .eq("id", user.id)
    .maybeSingle();
  const { data: deep } = await supabase
    .from("profile_deep")
    .select("goals, values, interests, dealbreakers")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: prefs } = await supabase
    .from("match_preferences")
    .select("min_age, max_age, regions, required_goals")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);
  const { data: priorLikes } = await supabase
    .from("likes")
    .select("target_id")
    .eq("actor_id", user.id);

  if (!me?.discovery_opt_in) {
    return jsonError("FORBIDDEN", "flagDiscoveryUserOff", requestId);
  }

  const { data: poolRows } = await supabase
    .from("profiles")
    .select(
      "id, display_name, birth_date, fuzzy_region, discovery_opt_in, hidden_from_discovery",
    )
    .eq("discovery_opt_in", true)
    .eq("hidden_from_discovery", false)
    .eq("suspended", false)
    .neq("id", user.id)
    .limit(200);

  const ids = (poolRows ?? []).map((p) => p.id);
  const { data: deepRows } = ids.length
    ? await supabase
        .from("profile_deep")
        .select("user_id, goals, values, interests, dealbreakers")
        .in("user_id", ids)
    : { data: [] as { user_id: string; goals: string[]; values: string[]; interests: string[]; dealbreakers: string[] }[] };

  const deepMap = new Map((deepRows ?? []).map((d) => [d.user_id, d]));
  const excluded = new Set([
    ...(blocks ?? []).map((b) => b.blocked_id),
    ...(priorLikes ?? []).map((l) => l.target_id),
  ]);

  const viewerProfile: DiscoveryProfile = {
    userId: user.id,
    displayName: me.display_name,
    birthDate: me.birth_date,
    fuzzyRegion: me.fuzzy_region ?? "",
    discoveryOptIn: me.discovery_opt_in,
    hiddenFromDiscovery: me.hidden_from_discovery,
    goals: deep?.goals ?? [],
    values: deep?.values ?? [],
    interests: deep?.interests ?? [],
    dealbreakers: deep?.dealbreakers ?? [],
  };

  const viewerPrefs: MatchPreferences = {
    userId: user.id,
    minAge: prefs?.min_age ?? 18,
    maxAge: prefs?.max_age ?? 99,
    regions: prefs?.regions ?? [],
    requiredGoals: prefs?.required_goals ?? [],
    excludedUserIds: [...excluded],
  };

  const pool: DiscoveryProfile[] = (poolRows ?? []).map((p) => {
    const d = deepMap.get(p.id);
    return {
      userId: p.id,
      displayName: p.display_name,
      birthDate: p.birth_date,
      fuzzyRegion: p.fuzzy_region ?? "",
      discoveryOptIn: p.discovery_opt_in,
      hiddenFromDiscovery: p.hidden_from_discovery,
      goals: d?.goals ?? [],
      values: d?.values ?? [],
      interests: d?.interests ?? [],
      dealbreakers: d?.dealbreakers ?? [],
    };
  });

  const ranked = rankCandidates(viewerPrefs, viewerProfile, pool).slice(0, pageSize);
  const byId = new Map(pool.map((p) => [p.userId, p]));
  const memberDefault = await apiT("memberDefault");
  const candidates = ranked.map((r) => {
    const p = byId.get(r.userId);
    return {
      userId: r.userId,
      score: r.score,
      reasons: r.reasons,
      displayName: p?.displayName ?? memberDefault,
      fuzzyRegion: p?.fuzzyRegion ?? "",
      interests: p?.interests ?? [],
    };
  });

  return NextResponse.json({
    data: { candidates },
    meta: { request_id: requestId, page_size: pageSize },
  });
}
