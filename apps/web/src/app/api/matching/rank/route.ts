import { NextResponse } from "next/server";
import {
  rankCandidates,
  type DiscoveryProfile,
  type MatchPreferences,
} from "@deepmatch/shared";
import { flagEnabled } from "@/lib/flags";
import { jsonError } from "@/lib/api-error";

export async function POST(req: Request) {
  if (
    !(await flagEnabled("ff_matching")) ||
    !(await flagEnabled("ff_discovery"))
  ) {
    return jsonError("FORBIDDEN", "flagDiscoveryOff");
  }

  const body = (await req.json()) as {
    viewerPrefs: MatchPreferences;
    viewerProfile: DiscoveryProfile;
    pool: DiscoveryProfile[];
  };

  // Server-side hard rule: strip any attempted forbidden payloads if present
  const sanitizedPool = body.pool.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    birthDate: p.birthDate,
    fuzzyRegion: p.fuzzyRegion,
    goals: p.goals ?? [],
    values: p.values ?? [],
    interests: p.interests ?? [],
    dealbreakers: p.dealbreakers ?? [],
    discoveryOptIn: p.discoveryOptIn,
    hiddenFromDiscovery: p.hiddenFromDiscovery,
  }));

  const ranked = rankCandidates(
    body.viewerPrefs,
    body.viewerProfile,
    sanitizedPool,
  );
  return NextResponse.json({
    ranked,
    mutualCreatesPair: false,
    ruleNote: "explainable self-declared signals only",
  });
}
