import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDiscoverMediaGate } from "./discover-gate";

describe("evaluateDiscoverMediaGate", () => {
  it("blocks under 3 images", () => {
    const r = evaluateDiscoverMediaGate({
      approvedOrPendingImages: 2,
      videoCount: 0,
    });
    assert.equal(r.discoverEligible, false);
    assert.ok(r.reasons.includes("need_min_3_images"));
  });

  it("allows 3–10 images and ≤2 videos", () => {
    assert.equal(
      evaluateDiscoverMediaGate({
        approvedOrPendingImages: 3,
        videoCount: 2,
      }).discoverEligible,
      true,
    );
  });

  it("blocks over max images or videos", () => {
    assert.equal(
      evaluateDiscoverMediaGate({
        approvedOrPendingImages: 11,
        videoCount: 0,
      }).discoverEligible,
      false,
    );
    assert.equal(
      evaluateDiscoverMediaGate({
        approvedOrPendingImages: 5,
        videoCount: 3,
      }).discoverEligible,
      false,
    );
  });
});
