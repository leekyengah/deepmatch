import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { CaseResult, QaRunReport, RunContext } from "./types.js";
import { redactSecrets } from "./safety.js";

export function newRunId(): string {
  const d = new Date();
  const stamp = d.toISOString().replace(/[:.]/g, "-");
  return `qa-${stamp}-${randomUUID().slice(0, 8)}`;
}

export function summarize(results: CaseResult[]) {
  const count = (o: CaseResult["outcome"]) =>
    results.filter((r) => r.outcome === o).length;
  return {
    total: results.length,
    pass: count("PASS"),
    fail: count("FAIL"),
    blocked: count("BLOCKED"),
    skipped: count("SKIPPED"),
    inconclusive: count("INCONCLUSIVE"),
    notRun: count("NOT_RUN"),
  };
}

export function buildReport(opts: {
  context: RunContext;
  results: CaseResult[];
  openBlockers: string[];
  durationMs: number;
  lifecycleEffect: QaRunReport["lifecycleEffect"];
  costEstimateUsd?: number;
}): QaRunReport {
  const summary = summarize(opts.results);
  const releaseRecommendation: QaRunReport["releaseRecommendation"] =
    summary.fail > 0 || summary.blocked > 0
      ? "NO-GO"
      : summary.pass === summary.total && summary.total > 0
        ? "CONDITIONAL"
        : "NO-GO";

  return {
    context: opts.context,
    results: opts.results,
    summary,
    openBlockers: opts.openBlockers,
    releaseRecommendation,
    gaStance: "NO-GO",
    costEstimateUsd: opts.costEstimateUsd,
    durationMs: opts.durationMs,
    lifecycleEffect: opts.lifecycleEffect,
    reviewerSignoff: { identity: null, status: "unsigned" },
  };
}

export function writeEvidence(
  report: QaRunReport,
  rootDir: string,
): { jsonPath: string; mdPath: string } {
  mkdirSync(rootDir, { recursive: true });
  const base = report.context.runId;
  const jsonPath = join(rootDir, `${base}.json`);
  const mdPath = join(rootDir, `${base}.md`);
  const json = redactSecrets(JSON.stringify(report, null, 2));
  writeFileSync(jsonPath, json, "utf8");
  writeFileSync(mdPath, redactSecrets(toMarkdown(report)), "utf8");
  writeFileSync(join(rootDir, "LATEST.json"), json, "utf8");
  return { jsonPath, mdPath };
}

export function toMarkdown(report: QaRunReport): string {
  const { context: c, summary: s } = report;
  const lines = [
    `# QA Run ${c.runId}`,
    ``,
    `- Project: ${c.projectId}`,
    `- Commit: ${c.commitSha}`,
    `- Branch: ${c.branch}`,
    `- Environment: ${c.environment.id} (${c.environment.kind}) ${c.environment.baseUrl}`,
    `- Suite: ${c.suite}`,
    `- Started: ${c.startedAt}`,
    `- Duration: ${report.durationMs}ms`,
    `- Actor: ${c.actor}`,
    ``,
    `## Summary`,
    ``,
    `| PASS | FAIL | BLOCKED | SKIPPED | INCONCLUSIVE | NOT_RUN | Total |`,
    `|-----:|-----:|--------:|--------:|-------------:|--------:|------:|`,
    `| ${s.pass} | ${s.fail} | ${s.blocked} | ${s.skipped} | ${s.inconclusive} | ${s.notRun} | ${s.total} |`,
    ``,
    `## Lifecycle effect`,
    ``,
    `${report.lifecycleEffect ?? "none"} (automated ceiling; not VERIFIED)`,
    ``,
    `## Release recommendation`,
    ``,
    `${report.releaseRecommendation} · GA stance: **${report.gaStance}**`,
    ``,
    `## Results`,
    ``,
  ];
  for (const r of report.results) {
    lines.push(
      `### ${r.id} — ${r.outcome}`,
      ``,
      `- Expected: ${r.expected ?? "—"}`,
      `- Actual: ${r.actual ?? r.detail ?? "—"}`,
      `- Class: ${r.failureClass ?? "—"}`,
      `- Remediation: ${r.remediation ?? "—"}`,
      `- Refs: ${JSON.stringify(r.requirements ?? {})}`,
      ``,
    );
  }
  if (report.openBlockers.length) {
    lines.push(`## Open blockers`, ``);
    for (const b of report.openBlockers) lines.push(`- ${b}`);
    lines.push(``);
  }
  lines.push(
    `## Signoff`,
    ``,
    `Reviewer: unsigned (independent human required for INDEPENDENT_REVIEW_APPROVED+)`,
    ``,
  );
  return lines.join("\n");
}

export function loadBaseline(path: string): QaRunReport | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as QaRunReport;
  } catch {
    return null;
  }
}

export function diffSummaries(
  baseline: QaRunReport | null,
  current: QaRunReport,
): string[] {
  if (!baseline) return ["No baseline — first run"];
  const notes: string[] = [];
  const b = baseline.summary;
  const c = current.summary;
  if (c.fail > b.fail) notes.push(`Regressions: fail ${b.fail} → ${c.fail}`);
  if (c.pass < b.pass) notes.push(`Pass count dropped ${b.pass} → ${c.pass}`);
  if (c.pass >= b.pass && c.fail <= b.fail) notes.push("No worse than baseline");
  return notes;
}
