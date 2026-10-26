import { NextResponse } from "next/server";
import {
  INTENT_GOAL_ALIASES,
  MIN_AGE_DEFAULT,
  evaluateDiscoverMediaGate,
  isAgeEligible,
  normalizeIntent,
  rankCandidates,
  type DiscoveryProfile,
  type MatchPreferences,
} from "@deepmatch/shared";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId, apiT } from "@/lib/api-error";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend } from "@/lib/media/limits";
import { isEmailVerified } from "@/lib/auth/email-verified";

const INTENT_GOALS: Record<string, string[]> = {
  friendship: INTENT_GOAL_ALIASES.friendship,
  dating: INTENT_GOAL_ALIASES.dating,
  marriage: INTENT_GOAL_ALIASES.marriage,
};

async function viewerDiscoverEligible(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<{ ok: boolean; reasons: string[] }> {
  const full = await supabase
    .from("media_objects")
    .select("content_type, moderation_status")
    .eq("owner_user_id", userId)
    .is("pair_id", null)
    .limit(50);
  const rows = full.data ?? [];
  const images = rows.filter((r: { content_type?: string }) =>
    String(r.content_type || "").startsWith("image/"),
  );
  const videos = rows.filter((r: { content_type?: string }) =>
    String(r.content_type || "").startsWith("video/"),
  );
  const approved = images.filter((r: { moderation_status?: string }) => {
    const st = r.moderation_status;
    return !st || st === "approved" || st === "pending";
  });
  const gate = evaluateDiscoverMediaGate({
    approvedOrPendingImages: approved.length,
    videoCount: videos.length,
  });
  return { ok: gate.discoverEligible, reasons: gate.reasons };
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
  if (!isEmailVerified(user)) {
    return jsonError("FORBIDDEN", "emailNotVerified", requestId);
  }

  const url = new URL(req.url);
  const pageSize = Math.min(Number(url.searchParams.get("page_size") ?? 24), 50);
  const intentRaw = (url.searchParams.get("intent") ?? "all").toLowerCase();
  const intent =
    intentRaw === "all"
      ? "all"
      : (normalizeIntent(intentRaw) ?? intentRaw);
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

  const minAgeHard = Number(process.env.MIN_AGE ?? MIN_AGE_DEFAULT);
  if (!me.birth_date || !isAgeEligible(me.birth_date, minAgeHard)) {
    return jsonError("FORBIDDEN", "ageUnderage", requestId);
  }

  const mediaGate = await viewerDiscoverEligible(supabase, user.id);
  if (!mediaGate.ok) {
    return NextResponse.json({
      data: {
        candidates: [],
        emptyReason: "MEDIA_GATE",
        gate: {
          discover_eligible: false,
          reasons: mediaGate.reasons,
        },
        meta: {
          poolCount: 0,
          excludedCount: 0,
          intent,
          strict,
          softMode: !strict,
        },
      },
      meta: { request_id: requestId, page_size: pageSize },
    });
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
