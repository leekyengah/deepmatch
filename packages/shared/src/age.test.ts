import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAgeEligible } from "./age";

describe("isAgeEligible", () => {
  const now = new Date("2026-10-11T00:00:00Z");

  it("allows 18+", () => {
    assert.equal(isAgeEligible("2008-10-11", 18, now), true);
  });

  it("denies under 18", () => {
    assert.equal(isAgeEligible("2009-10-12", 18, now), false);
  });

  it("denies invalid date", () => {
    assert.equal(isAgeEligible("not-a-date", 18, now), false);
  });
});
