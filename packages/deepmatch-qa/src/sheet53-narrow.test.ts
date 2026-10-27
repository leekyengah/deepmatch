import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildNarrowPatches,
  indexSheet53Rows,
  type Sheet53RowSnapshot,
} from "./sheet53-narrow.js";
import type { QaRunReport } from "@tradingbase/qa-core";

function report(results: QaRunReport["results"]): QaRunReport {
  return {
    context: {
      runId: "qa-test",
      projectId: "deepmatch",
      commitSha: "abcdef123456",
      branch: "test",
      environment: {
        id: "stg",
        baseUrl: "https://datingvn.com",
        kind: "staging",
        allowWrites: false,
      },
      startedAt: new Date().toISOString(),
      suite: "w2",
      actor: "test",
    },
    results,
    summary: {
      total: results.length,
      pass: 0,
      fail: 0,
      blocked: 0,
      skipped: 0,
      inconclusive: 0,
      notRun: 0,
    },
    openBlockers: [],
    releaseRecommendation: "NO-GO",
    gaStance: "NO-GO",
    durationMs: 1,
    lifecycleEffect: "QA_PASSED_AUTOMATED",
    reviewerSignoff: { identity: null, status: "unsigned" },
  };
}

describe("sheet53-narrow", () => {
  it("indexes FIX26 rows", () => {
    const map = indexSheet53Rows([
      ["Action ID", ..."x".repeat(20).split("")],
      ["FIX26-011", ...Array(15).fill(""), "old-ev", "NOT_RETESTED", "", "", "note"],
    ]);
    assert.equal(map.get("FIX26-011")?.rowNumber, 2);
    assert.equal(map.get("FIX26-011")?.qaIndependent, "NOT_RETESTED");
  });

  it("appends evidence and replaces NOT_RETESTED QA field", () => {
    const snap: Sheet53RowSnapshot = {
      rowNumber: 12,
      actionId: "FIX26-011",
      evidenceNew: "prior-evidence",
      qaIndependent: "NOT_RETESTED",
      signoff: "",
      notes: "keep-me",
    };
    const patches = buildNarrowPatches(
      report([
        {
          id: "DM-QA-P0-001",
          outcome: "PASS",
          requirements: { fixId: "FIX26-011" },
        },
      ]),
      new Map([["FIX26-011", snap]]),
    );
    const p = patches[0]!;
    assert.ok(p.cells.some((c) => c.field === "QA độc lập" && c.value === "QA_PASSED_AUTOMATED"));
    assert.ok(
      p.cells.some(
        (c) =>
          c.field === "Evidence mới / commit / test" &&
          c.value.includes("prior-evidence") &&
          c.value.includes("qa-test"),
      ),
    );
    assert.ok(p.cells.every((c) => !c.range.includes("!S")));
  });

  it("does not overwrite human VERIFIED QA column", () => {
    const snap: Sheet53RowSnapshot = {
      rowNumber: 3,
      actionId: "FIX26-003",
      evidenceNew: "",
      qaIndependent: "INDEPENDENT_REVIEW_APPROVED",
      signoff: "Founder 2026-10-01",
      notes: "",
    };
    const patches = buildNarrowPatches(
      report([
        {
          id: "x",
          outcome: "PASS",
          requirements: { fixId: "FIX26-003" },
        },
      ]),
      new Map([["FIX26-003", snap]]),
    );
    assert.ok(!patches[0]!.cells.some((c) => c.field === "QA độc lập"));
  });
});
