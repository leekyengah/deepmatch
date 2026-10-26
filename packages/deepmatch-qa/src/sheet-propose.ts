import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { QaRunReport } from "@tradingbase/qa-core";
import type { TrackerConfig } from "@tradingbase/qa-adapters";

/**
 * Never writes to Sheets unless tracker.writeEnabled AND QA_SHEETS_WRITE=1.
 * Default: emit proposed-update JSON for human review (BLOCKED_CONNECTOR if write requested without creds).
 */
export function proposeSheet53Updates(
  report: QaRunReport,
  tracker: TrackerConfig,
  outDir: string,
): { status: "proposed" | "skipped" | "BLOCKED_CONNECTOR"; path?: string } {
  if (tracker.kind !== "google_sheets") {
    return { status: "skipped" };
  }
  const wantWrite =
    tracker.writeEnabled && process.env.QA_SHEETS_WRITE === "1";
  const rows = report.results
    .filter((r) => r.requirements?.fixId)
    .map((r) => ({
      fixId: r.requirements!.fixId,
      auditId: r.requirements!.auditId,
      qaOwned: {
        "QA độc lập":
          r.outcome === "PASS"
            ? "QA_PASSED_AUTOMATED"
            : r.outcome === "FAIL"
              ? "QA_FAILED"
              : r.outcome,
        "Evidence mới / commit / test": `${report.context.runId} · ${report.context.commitSha.slice(0, 7)} · ${r.id}`,
        "Ghi chú": `automated only; not DONE_VERIFIED · ${r.detail ?? ""}`.slice(
          0,
          200,
        ),
      },
      doNotTouch: [
        "Verdict audit 26/10",
        "Trạng thái thực thi",
        "Owner đề xuất",
        "Hành động khắc phục + Acceptance Criteria",
        "Người ký duyệt / ngày",
      ],
    }));

  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${report.context.runId}-sheet53-proposed.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        status: wantWrite ? "WRITE_REQUESTED" : "PROPOSED_ONLY",
        spreadsheetId: tracker.spreadsheetId,
        sheet: "53 REMEDIATION EXECUTION PLAN",
        runId: report.context.runId,
        note: "Narrow QA-owned fields only. Never set DONE_VERIFIED automatically.",
        rows,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (wantWrite) {
    return { status: "BLOCKED_CONNECTOR", path };
  }
  return { status: "proposed", path };
}
