import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { QaRunReport } from "@tradingbase/qa-core";
import type { TrackerConfig } from "@tradingbase/qa-adapters";

/** Column letters on Sheet 53 (1-based headers A..U). */
export const SHEET53 = {
  name: "53 REMEDIATION EXECUTION PLAN",
  colActionId: "A",
  colEvidenceNew: "Q",
  colQaIndependent: "R",
  colSignoff: "S",
  colNotes: "U",
} as const;

const FORBIDDEN_AUTOMATED = new Set([
  "DONE_VERIFIED",
  "INDEPENDENT_REVIEW_APPROVED",
  "FOUNDER_UAT_APPROVED",
  "RELEASE_APPROVED",
  "VERIFIED",
]);

export type Sheet53RowSnapshot = {
  rowNumber: number;
  actionId: string;
  evidenceNew: string;
  qaIndependent: string;
  signoff: string;
  notes: string;
};

export type NarrowPatch = {
  rowNumber: number;
  actionId: string;
  /** Absolute A1 ranges → single cell values */
  cells: Array<{ range: string; value: string; field: string }>;
  skipped?: string;
};

function outcomeToQaField(outcome: string): string {
  if (outcome === "PASS") return "QA_PASSED_AUTOMATED";
  if (outcome === "FAIL") return "QA_FAILED";
  if (outcome === "BLOCKED") return "BLOCKED";
  return outcome;
}

function canReplaceQa(current: string): boolean {
  const c = (current || "").trim();
  if (!c) return true;
  if (c === "NOT_RETESTED") return true;
  if (c === "QA_FAILED" || c === "QA_PASSED_AUTOMATED" || c === "BLOCKED")
    return true;
  if (c === "READY_FOR_QA") return true;
  // Preserve human / independent labels
  if (/VERIFIED|APPROVED|SIGNED|FOUNDER|INDEPENDENT/i.test(c)) return false;
  return false;
}

function mergeEvidence(existing: string, addition: string): string {
  const add = addition.trim();
  if (!add) return existing || "";
  if (!existing?.trim()) return add;
  if (existing.includes(add)) return existing;
  // Append — never wipe historical evidence
  return `${existing.trim()} | ${add}`.slice(0, 450);
}

function mergeNotes(existing: string, addition: string): string {
  return mergeEvidence(existing, addition);
}

/**
 * Build narrow patches from a run + live row snapshots.
 * Never emits patches for signoff column or forbidden status tokens.
 */
export function buildNarrowPatches(
  report: QaRunReport,
  rowsByFixId: Map<string, Sheet53RowSnapshot>,
): NarrowPatch[] {
  const patches: NarrowPatch[] = [];
  const byFix = new Map<string, (typeof report.results)[number]>();
  for (const r of report.results) {
    const id = r.requirements?.fixId;
    if (!id) continue;
    // Never promote suite-filter noise into Sheet QA columns
    if (r.outcome === "SKIPPED" || r.outcome === "NOT_RUN") continue;
    // Prefer worse signal: FAIL > BLOCKED > INCONCLUSIVE > PASS
    const rank: Record<string, number> = {
      FAIL: 4,
      BLOCKED: 3,
      INCONCLUSIVE: 2,
      PASS: 1,
    };
    const prev = byFix.get(id);
    if (!prev || (rank[r.outcome] ?? 0) > (rank[prev.outcome] ?? 0)) {
      byFix.set(id, r);
    }
  }

  for (const [fixId, result] of byFix) {
    const snap = rowsByFixId.get(fixId);
    if (!snap) {
      patches.push({
        rowNumber: -1,
        actionId: fixId,
        cells: [],
        skipped: "row_not_found",
      });
      continue;
    }
    if (snap.signoff?.trim()) {
      // Signoff present — still allow evidence append + QA if replaceable, never touch S
    }
    const qaValue = outcomeToQaField(result.outcome);
    if (FORBIDDEN_AUTOMATED.has(qaValue)) {
      patches.push({
        rowNumber: snap.rowNumber,
        actionId: fixId,
        cells: [],
        skipped: "forbidden_qa_token",
      });
      continue;
    }

    const cells: NarrowPatch["cells"] = [];
    const evidenceAdd = `${report.context.runId} · ${report.context.commitSha.slice(0, 7)} · ${result.id}=${result.outcome}`;
    const mergedEv = mergeEvidence(snap.evidenceNew, evidenceAdd);
    if (mergedEv !== (snap.evidenceNew || "")) {
      cells.push({
        range: `'${SHEET53.name}'!${SHEET53.colEvidenceNew}${snap.rowNumber}`,
        value: mergedEv,
        field: "Evidence mới / commit / test",
      });
    }

    if (canReplaceQa(snap.qaIndependent)) {
      cells.push({
        range: `'${SHEET53.name}'!${SHEET53.colQaIndependent}${snap.rowNumber}`,
        value: qaValue,
        field: "QA độc lập",
      });
    } else {
      // Do not overwrite human QA / approvals
    }

    const noteAdd = `auto:${result.id} ${result.outcome}; not DONE_VERIFIED`;
    const mergedNotes = mergeNotes(snap.notes, noteAdd);
    if (mergedNotes !== (snap.notes || "")) {
      cells.push({
        range: `'${SHEET53.name}'!${SHEET53.colNotes}${snap.rowNumber}`,
        value: mergedNotes.slice(0, 450),
        field: "Ghi chú",
      });
    }

    patches.push({
      rowNumber: snap.rowNumber,
      actionId: fixId,
      cells,
      skipped: cells.length ? undefined : "no_cell_change",
    });
  }
  return patches;
}

export function writePatchPlan(
  report: QaRunReport,
  patches: NarrowPatch[],
  tracker: TrackerConfig,
  outDir: string,
): string {
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${report.context.runId}-sheet53-narrow-plan.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        spreadsheetId: tracker.spreadsheetId,
        sheet: SHEET53.name,
        runId: report.context.runId,
        policy: {
          writableFields: [
            "Evidence mới / commit / test",
            "QA độc lập",
            "Ghi chú",
          ],
          neverWrite: [
            "Verdict audit 26/10",
            "Trạng thái thực thi",
            "Owner đề xuất",
            "Hành động khắc phục + Acceptance Criteria",
            "Người ký duyệt / ngày",
            "DONE_VERIFIED",
          ],
          mergeEvidence: true,
        },
        patches,
      },
      null,
      2,
    ),
    "utf8",
  );
  return path;
}

/**
 * Parse Sheet53 values grid (incl header) into FIX26 → snapshot map.
 * Assumes col A = Action ID, Q/R/S/U as above (0-based indices 0,16,17,18,20).
 */
export function indexSheet53Rows(
  values: string[][],
  headerRow = 0,
): Map<string, Sheet53RowSnapshot> {
  const map = new Map<string, Sheet53RowSnapshot>();
  for (let i = headerRow + 1; i < values.length; i++) {
    const row = values[i] ?? [];
    const actionId = (row[0] ?? "").trim();
    if (!actionId.startsWith("FIX26-")) continue;
    map.set(actionId, {
      rowNumber: i + 1, // Sheets 1-based
      actionId,
      evidenceNew: row[16] ?? "",
      qaIndependent: row[17] ?? "",
      signoff: row[18] ?? "",
      notes: row[20] ?? "",
    });
  }
  return map;
}
