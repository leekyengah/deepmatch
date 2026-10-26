import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAgeEligible, MIN_AGE_DEFAULT } from "./age";

describe("isAgeEligible", () => {
  const now = new Date("2026-10-11T00:00:00Z");

  it("allows 18+", () => {
    assert.equal(isAgeEligible("2008-10-11", 18, now), true);
    assert.equal(isAgeEligible("2000-01-01", MIN_AGE_DEFAULT, now), true);
  });

  it("denies under 18", () => {
    assert.equal(isAgeEligible("2009-10-12", 18, now), false);
    assert.equal(isAgeEligible("2010-10-11", 18, now), false);
  });

  it("boundary: exactly 18 on birthday is eligible", () => {
    assert.equal(isAgeEligible("2008-10-11", 18, now), true);
  });

  it("boundary: day before 18th birthday is ineligible", () => {
    assert.equal(isAgeEligible("2008-10-12", 18, now), false);
  });

  it("denies invalid date", () => {
    assert.equal(isAgeEligible("not-a-date", 18, now), false);
    assert.equal(isAgeEligible("", 18, now), false);
  });

  it("rejects API-style bypass attempts with malformed ISO", () => {
    assert.equal(isAgeEligible("18", 18, now), false);
    assert.equal(isAgeEligible("2008-13-40", 18, now), false);
  });
});
