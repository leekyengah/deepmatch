import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildReport, writeEvidence, summarize } from "./evidence.js";

describe("evidence", () => {
  it("summarizes outcomes", () => {
    const s = summarize([
      { id: "a", outcome: "PASS" },
      { id: "b", outcome: "FAIL" },
      { id: "c", outcome: "BLOCKED" },
    ]);
    assert.equal(s.pass, 1);
    assert.equal(s.fail, 1);
    assert.equal(s.blocked, 1);
    assert.equal(s.total, 3);
  });

  it("writes redacted json and keeps GA NO-GO", () => {
    const dir = mkdtempSync(join(tmpdir(), "tb-qa-"));
    try {
      const report = buildReport({
        context: {
          runId: "qa-test-1",
          projectId: "deepmatch",
          commitSha: "abc",
          branch: "test",
          environment: {
            id: "stg",
            baseUrl: "https://datingvn.com",
            kind: "staging",
            allowWrites: false,
          },
          startedAt: new Date().toISOString(),
          suite: "unit",
          actor: "test",
        },
        results: [{ id: "t1", outcome: "PASS" }],
        openBlockers: [],
        durationMs: 12,
        lifecycleEffect: "QA_PASSED_AUTOMATED",
      });
      assert.equal(report.gaStance, "NO-GO");
      const { jsonPath } = writeEvidence(report, dir);
      const raw = readFileSync(jsonPath, "utf8");
      assert.match(raw, /QA_PASSED_AUTOMATED/);
      assert.match(raw, /NO-GO/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
