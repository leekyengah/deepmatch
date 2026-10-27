/** Canonical discovery / onboarding intents (C01 + Discover API). */
export const CANONICAL_INTENTS = [
  "friendship",
  "dating",
  "marriage",
] as const;

export type CanonicalIntent = (typeof CANONICAL_INTENTS)[number];

const LEGACY_TO_CANONICAL: Record<string, CanonicalIntent> = {
  friendship: "friendship",
  friends: "friendship",
  ban_be: "friendship",
  companion: "friendship",
  talks: "friendship",
  dating: "dating",
  hen_ho: "dating",
  serious: "dating",
  long_term: "dating",
  marriage: "marriage",
  hon_nhan: "marriage",
};

/** Map free-form / legacy intent tokens to canonical goals[]. */
export function normalizeIntent(
  raw: string | null | undefined,
): CanonicalIntent | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  return LEGACY_TO_CANONICAL[key] ?? null;
}

export function isCanonicalIntent(v: string): v is CanonicalIntent {
  return (CANONICAL_INTENTS as readonly string[]).includes(v);
}

/** Soft aliases used by rankCandidates intentBoost / requiredGoals. */
export const INTENT_GOAL_ALIASES: Record<CanonicalIntent, string[]> = {
  friendship: [
    "friendship",
    "friends",
    "companion",
    "talks",
    "kết bạn",
    "ban_be",
  ],
  dating: [
    "dating",
    "serious",
    "long_term",
    "hẹn hò",
    "hen_ho",
  ],
  marriage: [
    "marriage",
    "long_term",
    "hôn nhân",
    "hon_nhan",
    "serious",
  ],
};
