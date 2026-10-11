import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FORBIDDEN_RANK_SIGNALS,
  isMutual,
  mutualCreatesPairSpace,
  rankCandidates,
} from "./engine";
import type { DiscoveryProfile, MatchPreferences } from "../types";

const base = (over: Partial<DiscoveryProfile>): DiscoveryProfile => ({
  userId: "u1",
  displayName: "A",
  birthDate: "1995-01-01",
  fuzzyRegion: "HN",
  goals: ["long_term"],
  values: ["kindness"],
  interests: ["coffee", "travel"],
  dealbreakers: [],
  discoveryOptIn: true,
  hiddenFromDiscovery: false,
  ...over,
});

describe("matching engine", () => {
  const viewerPrefs: MatchPreferences = {
    userId: "viewer",
    minAge: 21,
    maxAge: 40,
    regions: ["HN"],
    requiredGoals: ["long_term"],
    excludedUserIds: ["blocked"],
  };
  const viewer = base({ userId: "viewer", interests: ["coffee", "books"] });

  it("ranks eligible candidates and excludes blocked/hidden/underage", () => {
    const pool = [
      base({ userId: "good", interests: ["coffee", "travel"] }),
      base({ userId: "blocked" }),
      base({ userId: "hidden", hiddenFromDiscovery: true }),
      base({ userId: "kid", birthDate: "2015-01-01" }),
      base({ userId: "sg", fuzzyRegion: "SG" }),
    ];
    const ranked = rankCandidates(viewerPrefs, viewer, pool);
    assert.deepEqual(
      ranked.map((r) => r.userId),
      ["good"],
    );
    assert.ok(ranked[0].reasons.length > 0);
    assert.ok(!ranked[0].reasons.some((x) => /xác suất yêu/i.test(x)));
  });

  it("mutual like does not create pair space", () => {
    assert.equal(isMutual({ aLikesB: true, bLikesA: true }), true);
    assert.equal(mutualCreatesPairSpace(), false);
  });

  it("documents forbidden rank signals", () => {
    assert.ok(FORBIDDEN_RANK_SIGNALS.includes("exact_gps"));
    assert.ok(FORBIDDEN_RANK_SIGNALS.includes("private_diary"));
  });
});
