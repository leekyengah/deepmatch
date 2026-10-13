import { NextResponse } from "next/server";
import {
  rankCandidates,
  type DiscoveryProfile,
  type MatchPreferences,
} from "@deepmatch/shared";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend } from "@/lib/media/limits";

const INTENT_GOALS: Record<string, string[]> = {
  friendship: ["friendship", "friends", "kết bạn", "ban_be"],
  dating: ["dating", "serious", "hẹn hò", "hen_ho", "long_term"],
  marriage: ["marriage", "long_term", "hôn nhân", "hon_nhan", "serious"],
};

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
  const pageSize = Math.min(Number(url.searchParams.get("page_size") ?? 24), 50);
  const intent = (url.searchParams.get("intent") ?? "all").toLowerCase();
  const strict = url.searchParams.get("strict") === "1";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const regionFilter = (url.searchParams.get("region") ?? "").trim();
  const minAgeQ = Number(url.searchParams.get("min_age"));
  const maxAgeQ = Number(url.searchParams.get("max_age"));

  const { data: me } = await supabase
    .from("profiles")
    .select(
      "id, display_name, birth_date, fuzzy_region, discovery_opt_in, hidden_from_discovery, avatar_path, bio, job_title",
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
      "id, display_name, birth_date, fuzzy_region, discovery_opt_in, hidden_from_discovery, avatar_path, bio, job_title",
    )
    .eq("discovery_opt_in", true)
    .eq("hidden_from_discovery", false)
    .eq("suspended", false)
    .neq("id", user.id)
    .limit(200);

  const poolCount = poolRows?.length ?? 0;
  const ids = (poolRows ?? []).map((p) => p.id);
  const { data: deepRows } = ids.length
    ? await supabase
        .from("profile_deep")
        .select("user_id, goals, values, interests, dealbreakers")
        .in("user_id", ids)
    : {
        data: [] as {
          user_id: string;
          goals: string[];
          values: string[];
          interests: string[];
          dealbreakers: string[];
        }[],
      };

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

  const minAge = Number.isFinite(minAgeQ)
    ? minAgeQ
    : (prefs?.min_age ?? 18);
  const maxAge = Number.isFinite(maxAgeQ)
    ? maxAgeQ
    : (prefs?.max_age ?? 99);

  const regions =
    regionFilter.length > 0
      ? [regionFilter]
      : strict
        ? (prefs?.regions ?? [])
        : [];

  const requiredGoals =
    strict && intent !== "all" && INTENT_GOALS[intent]
      ? INTENT_GOALS[intent]
      : strict
        ? (prefs?.required_goals ?? [])
        : [];

  const viewerPrefs: MatchPreferences = {
    userId: user.id,
    minAge,
    maxAge,
    regions,
    requiredGoals,
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

  const intentBoost =
    intent !== "all" && INTENT_GOALS[intent] ? INTENT_GOALS[intent] : [];

  let ranked = rankCandidates(viewerPrefs, viewerProfile, pool, new Date(), {
    softMode: !strict,
    intentBoost,
  });

  if (q) {
    ranked = ranked.filter((r) => {
      const p = pool.find((x) => x.userId === r.userId);
      const name = (p?.displayName ?? "").toLowerCase();
      const region = (p?.fuzzyRegion ?? "").toLowerCase();
      const interests = (p?.interests ?? []).join(" ").toLowerCase();
      return name.includes(q) || region.includes(q) || interests.includes(q);
    });
  }

  ranked = ranked.slice(0, pageSize);
  const byId = new Map(pool.map((p) => [p.userId, p]));
  const rowById = new Map((poolRows ?? []).map((p) => [p.id, p]));
  const memberDefault = await apiT("memberDefault");
  const backend = getStorageBackend();

  const candidates = await Promise.all(
    ranked.map(async (r) => {
      const p = byId.get(r.userId);
      const row = rowById.get(r.userId);
      let avatarUrl: string | null = null;
      const path = row?.avatar_path as string | null | undefined;
      if (path) {
        try {
          avatarUrl = await createSignedReadUrl(path, backend, 600);
        } catch {
          avatarUrl = null;
        }
      }
      return {
        userId: r.userId,
        score: r.score,
        reasons: r.reasons,
        displayName: p?.displayName ?? memberDefault,
        fuzzyRegion: p?.fuzzyRegion ?? "",
        interests: p?.interests ?? [],
        goals: p?.goals ?? [],
        values: p?.values ?? [],
        bio: (row?.bio as string | null) ?? null,
        jobTitle: (row?.job_title as string | null) ?? null,
        age: ageYears(p?.birthDate),
        avatarUrl,
        compatibility: r.breakdown
          ? {
              composite: r.breakdown.composite,
              confidence: r.breakdown.confidence,
              dataMissing: r.breakdown.dataMissing,
              parts: {
                intent: r.breakdown.intent,
                values: r.breakdown.values,
                lifestyle: r.breakdown.lifestyle,
                communication: r.breakdown.communication,
                proximity: r.breakdown.proximity,
              },
            }
          : null,
      };
    }),
  );

  let emptyReason: string | null = null;
  if (candidates.length === 0) {
    if (poolCount === 0) emptyReason = "NO_POOL";
    else if (excluded.size >= poolCount) emptyReason = "ACTED_ALL";
    else if (strict || regionFilter || q) emptyReason = "FILTERS_STRICT";
    else emptyReason = "NO_MATCH";
  }

  return NextResponse.json({
    data: {
      candidates,
      emptyReason,
      meta: {
        poolCount,
        excludedCount: excluded.size,
        intent,
        strict,
        softMode: !strict,
      },
    },
    meta: { request_id: requestId, page_size: pageSize },
  });
}
