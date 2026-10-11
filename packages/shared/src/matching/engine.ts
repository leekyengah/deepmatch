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

export function passesHardFilters(
  viewer: MatchPreferences,
  candidate: DiscoveryProfile,
  now = new Date(),
): boolean {
  if (!candidate.discoveryOptIn || candidate.hiddenFromDiscovery) return false;
  if (!isAgeEligible(candidate.birthDate, 18, now)) return false;
  if (viewer.excludedUserIds.includes(candidate.userId)) return false;
  if (candidate.userId === viewer.userId) return false;

  const age = ageYears(candidate.birthDate, now);
  if (age < viewer.minAge || age > viewer.maxAge) return false;

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

  return true;
}

export function rankCandidates(
  viewerPrefs: MatchPreferences,
  viewerProfile: DiscoveryProfile,
  pool: DiscoveryProfile[],
  now = new Date(),
): RankedCandidate[] {
  const ranked: RankedCandidate[] = [];

  for (const candidate of pool) {
    if (!passesHardFilters(viewerPrefs, candidate, now)) continue;

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

    const dealbreakerHit = candidate.dealbreakers.some((d) =>
      viewerProfile.interests.includes(d),
    );
    if (dealbreakerHit) score -= 10;

    ranked.push({
      userId: candidate.userId,
      score,
      reasons: buildReasons({
        sharedInterests,
        sharedValues,
        sharedGoals,
        sameRegion: viewerProfile.fuzzyRegion === candidate.fuzzyRegion,
      }),
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
