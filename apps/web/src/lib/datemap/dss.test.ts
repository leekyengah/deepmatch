import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { budgetFitScore, computeDss, reputationFromRating } from "./dss";

describe("DSS v1", () => {
  it("returns insufficient_data when too few signals", () => {
    const r = computeDss({ quietness: 80 });
    assert.equal(r.matchClass, "insufficient_data");
    assert.equal(r.score, null);
  });

  it("does not impute missing budget", () => {
    const r = computeDss({
      quietness: 80,
      privacy: 75,
      reputation: 70,
      location: 60,
      dataConfidence: 50,
    });
    assert.equal(r.parts.B, null);
    assert.ok(r.reasons.includes("missing_budget_fit"));
  });

  it("budgetFitScore handles couple total", () => {
    assert.equal(budgetFitScore(500_000, 200_000, 400_000), 100);
    assert.ok((budgetFitScore(300_000, 400_000, 600_000) ?? 0) < 50);
    assert.equal(budgetFitScore(null, 100, 200), null);
  });

  it("reputation needs count", () => {
    assert.equal(reputationFromRating(4.5, 0), null);
    assert.ok((reputationFromRating(4.5, 20) ?? 0) > 50);
  });
});
