import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clearRegistry, getAdapter, FUTURE_PROJECT_STUBS } from "@tradingbase/qa-adapters";
import { registerDeepMatchAdapter, loadCatalog } from "./adapter.js";

describe("deepmatch adapter", () => {
  beforeEach(() => clearRegistry());

  it("loads catalog with P0 pair_pins case", () => {
    const cases = loadCatalog();
    assert.ok(cases.some((c) => c.id === "DM-QA-P0-001"));
    assert.ok(cases.some((c) => c.runner === "accept_pair_pins"));
  });

  it("registers executable deepmatch adapter", () => {
    registerDeepMatchAdapter();
    const a = getAdapter("deepmatch");
    assert.equal(a.projectId, "deepmatch");
    assert.equal(a.tracker.writeEnabled, false);
    assert.ok(a.safety.allowedHosts.includes("datingvn.com"));
  });

  it("keeps future projects non-executable", () => {
    assert.ok(FUTURE_PROJECT_STUBS.every((s) => !s.allowExecution));
  });
});
