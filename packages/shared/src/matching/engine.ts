import { isAgeEligible } from "../age";
import type {
  DiscoveryProfile,
  MatchPreferences,
  RankedCandidate,
} from "../types";
import { buildReasons } from "./explain";

/** Forbidden signals must never appear in ranking inputs or logs. */
export const FORBIDDEN_RANK_SIGNALS = [
  "private_diary",
  "exact_gps",
  "advisor_notes",
  "love_probability",
] as const;

export type RankOptions = {
  /** When true, skip region + requiredGoals hard filters (Discover V2 default). */
  softMode?: boolean;
  /** Soft boost when candidate shares any of these goal tags. */
  intentBoost?: string[];
};

export type CompatibilityBreakdown = {
  intent: number | null;
  values: number | null;
  lifestyle: number | null;
  communication: number | null;
  proximity: number | null;
  /** Experimental composite 0–100; not a scientific prediction. */
  composite: number | null;
  confidence: "low" | "medium" | "high";
  dataMissing: string[];
};

export function passesHardFilters(
  viewer: MatchPreferences,
  candidate: DiscoveryProfile,
  now = new Date(),
  options: RankOptions = {},
): boolean {
  if (!candidate.discoveryOptIn || candidate.hiddenFromDiscovery) return false;
  if (!isAgeEligible(candidate.birthDate, 18, now)) return false;
  if (viewer.excludedUserIds.includes(candidate.userId)) return false;
  if (candidate.userId === viewer.userId) return false;

  const age = ageYears(candidate.birthDate, now);
  if (age < viewer.minAge || age > viewer.maxAge) return false;

  if (!options.softMode) {
    if (
      viewer.regions.length > 0 &&
      !viewer.regions.includes(candidate.fuzzyRegion)
    ) {
      return false;
    }

    if (viewer.requiredGoals.length > 0) {
      const ok = viewer.requiredGoals.every((g) => candidate.goals.includes(g));
      if (!ok) return false;
    }
  }

  return true;
}

/** Experimental weights from Discover V2 brief — hypothesis only. */
const W = { I: 0.35, V: 0.25, L: 0.15, C: 0.15, P: 0.1 } as const;

export function compatibilityBreakdown(
  viewerProfile: DiscoveryProfile,
  candidate: DiscoveryProfile,
  intentBoost: string[] = [],
): CompatibilityBreakdown {
  const dataMissing: string[] = [];
  const sharedInterests = intersect(
    viewerProfile.interests,
    candidate.interests,
  );
  const sharedValues = intersect(viewerProfile.values, candidate.values);
  const sharedGoals = intersect(viewerProfile.goals, candidate.goals);
  const intentGoals =
    intentBoost.length > 0
      ? intersect(intentBoost, candidate.goals)
      : sharedGoals;

  if (!viewerProfile.goals.length && !intentBoost.length) {
    dataMissing.push("intent");
  }
  if (!viewerProfile.values.length || !candidate.values.length) {
    dataMissing.push("values");
  }
  if (!viewerProfile.interests.length || !candidate.interests.length) {
    dataMissing.push("lifestyle");
  }
  // No dedicated communication field in schema — mark missing
  dataMissing.push("communication");
  if (!viewerProfile.fuzzyRegion || !candidate.fuzzyRegion) {
    dataMissing.push("proximity");
  }

  const intent =
    intentGoals.length || sharedGoals.length
      ? Math.min(100, (intentGoals.length || sharedGoals.length) * 34)
      : dataMissing.includes("intent")
        ? null
        : 20;
  const values = sharedValues.length
    ? Math.min(100, sharedValues.length * 34)
    : dataMissing.includes("values")
      ? null
      : 15;
  const lifestyle = sharedInterests.length
    ? Math.min(100, sharedInterests.length * 25)
    : dataMissing.includes("lifestyle")
      ? null
      : 15;
  const communication: number | null = null;
  const proximity =
    viewerProfile.fuzzyRegion &&
    candidate.fuzzyRegion &&
    viewerProfile.fuzzyRegion === candidate.fuzzyRegion
      ? 80
      : viewerProfile.fuzzyRegion && candidate.fuzzyRegion
        ? 35
        : null;

  const parts: Array<[number, number]> = [];
  if (intent != null) parts.push([intent, W.I]);
  if (values != null) parts.push([values, W.V]);
  if (lifestyle != null) parts.push([lifestyle, W.L]);
  if (communication != null) parts.push([communication, W.C]);
  if (proximity != null) parts.push([proximity, W.P]);

  let composite: number | null = null;
  if (parts.length >= 2) {
    const wSum = parts.reduce((s, [, w]) => s + w, 0);
    composite = Math.round(
      parts.reduce((s, [v, w]) => s + v * w, 0) / (wSum || 1),
    );
  }

  const filled = 5 - dataMissing.length;
  const confidence: CompatibilityBreakdown["confidence"] =
    filled >= 4 ? "high" : filled >= 2 ? "medium" : "low";

  return {
    intent,
    values,
    lifestyle,
    communication,
    proximity,
    composite,
    confidence,
    dataMissing,
  };
}

export function rankCandidates(
  viewerPrefs: MatchPreferences,
  viewerProfile: DiscoveryProfile,
  pool: DiscoveryProfile[],
  now = new Date(),
  options: RankOptions = {},
): RankedCandidate[] {
  const ranked: RankedCandidate[] = [];
  const intentBoost = options.intentBoost ?? [];

  for (const candidate of pool) {
    if (!passesHardFilters(viewerPrefs, candidate, now, options)) continue;

    let score = 0;
    const sharedInterests = intersect(
      viewerProfile.interests,
      candidate.interests,
    );
    const sharedValues = intersect(viewerProfile.values, candidate.values);
    const sharedGoals = intersect(viewerProfile.goals, candidate.goals);

    score += sharedInterests.length * 3;
    score += sharedValues.length * 4;
    score += sharedGoals.length * 5;
    if (viewerProfile.fuzzyRegion === candidate.fuzzyRegion) score += 2;

    if (intentBoost.length) {
      const hit = intersect(intentBoost, candidate.goals);
      score += hit.length * 6;
    }

    const dealbreakerHit = candidate.dealbreakers.some((d) =>
      viewerProfile.interests.includes(d),
    );
    if (dealbreakerHit) score -= 10;

    const breakdown = compatibilityBreakdown(
      viewerProfile,
      candidate,
      intentBoost,
    );

    ranked.push({
      userId: candidate.userId,
      score,
      reasons: buildReasons({
        sharedInterests,
        sharedValues,
        sharedGoals,
        sameRegion: viewerProfile.fuzzyRegion === candidate.fuzzyRegion,
      }),
      breakdown,
    });
  }

  return ranked.sort(
    (a, b) => b.score - a.score || a.userId.localeCompare(b.userId),
  );
}

export function isMutual(input: {
  aLikesB: boolean;
  bLikesA: boolean;
}): boolean {
  return input.aLikesB && input.bLikesA;
}

/** Mutual like must NOT create a couple pair space. */
export function mutualCreatesPairSpace(): false {
  return false;
}

function ageYears(birthDateIso: string, now: Date): number {
  const birth = new Date(birthDateIso);
  return (
    now.getFullYear() -
    birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0)
  );
}

function intersect(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}
