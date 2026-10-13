/**
 * DeepMatch Suitability Score (DSS) v1 experimental.
 * DSS = 0.25Q + 0.25P + 0.20B + 0.15R + 0.10L + 0.05C
 * Missing inputs are not imputed — confidence drops; may return insufficient_data.
 */

export const DSS_VERSION = "1.0-exp";

export type DssInputs = {
  quietness?: number | null; // 0–100
  privacy?: number | null;
  budgetFit?: number | null;
  reputation?: number | null;
  location?: number | null;
  dataConfidence?: number | null;
};

export type DssResult = {
  version: typeof DSS_VERSION;
  matchClass: "verified_match" | "potential_match" | "insufficient_data";
  score: number | null;
  confidence: number;
  parts: {
    Q: number | null;
    P: number | null;
    B: number | null;
    R: number | null;
    L: number | null;
    C: number | null;
  };
  reasons: string[];
};

function clamp01(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function computeDss(input: DssInputs): DssResult {
  const Q = input.quietness == null ? null : clamp01(input.quietness);
  const P = input.privacy == null ? null : clamp01(input.privacy);
  const B = input.budgetFit == null ? null : clamp01(input.budgetFit);
  const R = input.reputation == null ? null : clamp01(input.reputation);
  const L = input.location == null ? null : clamp01(input.location);
  const C = input.dataConfidence == null ? null : clamp01(input.dataConfidence);

  const present = [Q, P, B, R, L, C].filter((x): x is number => x != null);
  const confidence = (present.length / 6) * (C ?? 50);
  const reasons: string[] = [];

  if (Q == null) reasons.push("missing_quietness");
  if (P == null) reasons.push("missing_privacy");
  if (B == null) reasons.push("missing_budget_fit");
  if (R == null) reasons.push("missing_reputation");
  if (L == null) reasons.push("missing_location");
  if (C == null) reasons.push("missing_confidence");

  if (present.length < 3 || confidence < 25) {
    return {
      version: DSS_VERSION,
      matchClass: "insufficient_data",
      score: null,
      confidence,
      parts: { Q, P, B, R, L, C },
      reasons,
    };
  }

  const weights = { Q: 0.25, P: 0.25, B: 0.2, R: 0.15, L: 0.1, C: 0.05 };
  let num = 0;
  let den = 0;
  (["Q", "P", "B", "R", "L", "C"] as const).forEach((k) => {
    const v = { Q, P, B, R, L, C }[k];
    if (v != null) {
      num += v * weights[k];
      den += weights[k];
    }
  });
  const score = den > 0 ? Math.round(num / den) : null;

  let matchClass: DssResult["matchClass"] = "potential_match";
  if (score != null && score >= 70 && confidence >= 55 && Q != null && P != null) {
    matchClass = "verified_match";
  } else if (score == null || confidence < 35) {
    matchClass = "insufficient_data";
  }

  if (matchClass === "verified_match") reasons.push("strong_qp_budget");
  if (matchClass === "potential_match") reasons.push("partial_signal");

  return {
    version: DSS_VERSION,
    matchClass,
    score,
    confidence: Math.round(confidence),
    parts: { Q, P, B, R, L, C },
    reasons,
  };
}

export function budgetFitScore(
  coupleBudgetMax: number | null | undefined,
  placeMin: number | null | undefined,
  placeMax: number | null | undefined,
): number | null {
  if (coupleBudgetMax == null || placeMin == null || placeMax == null) return null;
  if (placeMax <= coupleBudgetMax) return 100;
  if (placeMin > coupleBudgetMax) return 15;
  const mid = (placeMin + placeMax) / 2;
  const over = mid - coupleBudgetMax;
  const span = Math.max(placeMax - placeMin, 1);
  return clamp01(100 - (over / span) * 80);
}

export function reputationFromRating(
  mean: number | null | undefined,
  count: number | null | undefined,
): number | null {
  if (mean == null || !count || count <= 0) return null;
  const base = (mean / 5) * 100;
  const volume = Math.min(1, count / 30);
  return clamp01(base * (0.55 + 0.45 * volume));
}
