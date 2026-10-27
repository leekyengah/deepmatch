import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertAutomatedTransition,
  canTransition,
  lifecycleFromResults,
} from "./status-machine.js";

describe("status-machine", () => {
  it("allows READY_FOR_QA → QA_PASSED_AUTOMATED", () => {
    assert.equal(canTransition("READY_FOR_QA", "QA_PASSED_AUTOMATED"), true);
    assert.doesNotThrow(() =>
      assertAutomatedTransition("READY_FOR_QA", "QA_PASSED_AUTOMATED"),
    );
  });

  it("blocks automated self-sign of independent review", () => {
    assert.equal(
      canTransition("QA_PASSED_AUTOMATED", "INDEPENDENT_REVIEW_APPROVED"),
      true,
    );
    assert.throws(
      () =>
        assertAutomatedTransition(
          "QA_PASSED_AUTOMATED",
          "INDEPENDENT_REVIEW_APPROVED",
        ),
      /independent human signoff/,
    );
  });

  it("blocks RELEASE_APPROVED from automated path", () => {
    assert.throws(
      () =>
        assertAutomatedTransition("FOUNDER_UAT_APPROVED", "RELEASE_APPROVED"),
      /independent human signoff/,
    );
  });

  it("maps failures to QA_FAILED", () => {
    assert.equal(
      lifecycleFromResults({
        ran: true,
        anyFail: true,
        anyBlocked: false,
        allPass: false,
      }),
      "QA_FAILED",
    );
  });

  it("maps all pass to QA_PASSED_AUTOMATED", () => {
    assert.equal(
      lifecycleFromResults({
        ran: true,
        anyFail: false,
        anyBlocked: false,
        allPass: true,
      }),
      "QA_PASSED_AUTOMATED",
    );
  });
});
