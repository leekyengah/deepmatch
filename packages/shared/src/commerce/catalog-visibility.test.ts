import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCustomerVisibleDiscoverBio,
  isCustomerVisibleFulfillment,
  isCustomerVisibleProviderStatus,
  isDiscoverCohortVisible,
} from "./catalog-visibility";

describe("catalog-visibility", () => {
  it("hides DEMO provider status", () => {
    assert.equal(isCustomerVisibleProviderStatus("DEMO"), false);
    assert.equal(isCustomerVisibleProviderStatus("listed"), true);
  });

  it("hides SANDBOX_ONLY fulfillment", () => {
    assert.equal(isCustomerVisibleFulfillment("SANDBOX_ONLY"), false);
    assert.equal(isCustomerVisibleFulfillment("PARTNER"), true);
  });

  it("treats cohort as purge marker only (Discover peers)", () => {
    assert.equal(isDiscoverCohortVisible(null, "Mebertes"), true);
    assert.equal(isDiscoverCohortVisible(null, null), true);
    assert.equal(isDiscoverCohortVisible("Mebertes", "Mebertes"), true);
    assert.equal(isDiscoverCohortVisible("Mebertes", null), true);
  });

  it("does not hide Mebertes bios from Discover", () => {
    assert.equal(
      isCustomerVisibleDiscoverBio("Synthetic Mebertes · HN · CC"),
      true,
    );
    assert.equal(isCustomerVisibleDiscoverBio("Loves coffee and travel"), true);
  });
});
