import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAdapter, FUTURE_PROJECT_STUBS } from "@tradingbase/qa-adapters";
import { runOrchestrator } from "@tradingbase/qa-core";
import { registerDeepMatchAdapter, resolveMonorepoRoot } from "./adapter.js";
import { proposeSheet53Updates } from "./sheet-propose.js";
import {
  buildNarrowPatches,
  indexSheet53Rows,
  writePatchPlan,
  type Sheet53RowSnapshot,
} from "./sheet53-narrow.js";
import { readHistoricalPairPinsRootCause } from "./runners/index.js";

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = { suite: "unit" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--suite") out.suite = argv[++i] ?? "unit";
    else if (a === "--env") out.env = argv[++i] ?? "dm-staging";
    else if (a === "--seed") out.seed = true;
    else if (a === "--write-sheet") out.writeSheet = true;
    else if (a === "--sheet-snapshot") out.sheetSnapshot = argv[++i] ?? "";
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--list-projects") out.list = true;
  }
  return out;
}

function loadSheetSnapshot(
  path: string | undefined,
): Map<string, Sheet53RowSnapshot> | null {
  if (!path || !existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    values?: string[][];
  };
  if (!raw.values) return null;
  return indexSheet53Rows(raw.values);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`DeepMatch QA adapter CLI

  npx tsx packages/deepmatch-qa/src/cli.ts --suite unit|p0|w2|security|e2e|all
  npx tsx packages/deepmatch-qa/src/cli.ts --suite w2 --env dm-staging
  npx tsx packages/deepmatch-qa/src/cli.ts --suite p0 --write-sheet --sheet-snapshot path.json

Sheet writes: narrow QA columns only (Q/R/U). Never signoff / DONE_VERIFIED.
Requires QA_SHEETS_WRITE=1 AND --write-sheet; default is propose-only.
GA stance remains NO-GO.
`);
    process.exit(0);
  }

  if (args.list) {
    console.log(
      JSON.stringify(
        [
          {
            projectId: "deepmatch",
            enabled: true,
            allowExecution: true,
          },
          ...FUTURE_PROJECT_STUBS,
        ],
        null,
        2,
      ),
    );
    process.exit(0);
  }

  const root = resolveMonorepoRoot();
  registerDeepMatchAdapter(root);
  const adapter = getAdapter("deepmatch");
  const envId = String(args.env || adapter.defaultEnvironmentId);
  const environment = adapter.environments.find((e) => e.id === envId);
  if (!environment) {
    console.error(`Unknown env ${envId}`);
    process.exit(2);
  }

  if (args.seed && adapter.seed) {
    console.log("Seeding synthetic QA pair…");
    const seeded = await adapter.seed();
    console.log(
      seeded.ok ? `SEED OK — ${seeded.detail}` : `SEED FAIL — ${seeded.detail}`,
    );
    if (!seeded.ok) process.exit(2);
  }

  const hist = readHistoricalPairPinsRootCause(root);
  if (hist) console.log(`pair_pins history: ${hist}`);

  const { report, jsonPath, mdPath, regression } = await runOrchestrator({
    projectId: adapter.projectId,
    suite: String(args.suite),
    cases: adapter.catalog,
    environment,
    policy: adapter.safety,
    projectRoot: adapter.projectRoot,
    evidenceDir: adapter.evidenceDir,
    runners: adapter.runners,
    costEstimateUsd: 0,
  });

  const proposed = proposeSheet53Updates(
    report,
    adapter.tracker,
    adapter.evidenceDir,
  );

  const snapshot =
    loadSheetSnapshot(String(args.sheetSnapshot || "")) ||
    loadSheetSnapshot(
      join(adapter.evidenceDir, "sheet53-snapshot.json"),
    );
  let narrowPlanPath: string | undefined;
  let sheetApply: string = proposed.status;
  if (snapshot) {
    const patches = buildNarrowPatches(report, snapshot);
    narrowPlanPath = writePatchPlan(
      report,
      patches,
      adapter.tracker,
      adapter.evidenceDir,
    );
    const wantWrite =
      Boolean(args.writeSheet) &&
      process.env.QA_SHEETS_WRITE === "1" &&
      adapter.tracker.writeEnabled;
    if (wantWrite) {
      sheetApply = "BLOCKED_CONNECTOR";
      // Live Sheets API credentials are not embedded in the CLI.
      // Agent/MCP or approved service account applies narrow-plan cells.
    } else if (args.writeSheet) {
      sheetApply = "BLOCKED_CONNECTOR";
    } else {
      sheetApply = "narrow_plan";
    }
  }

  const execPath = join(adapter.evidenceDir, "EXECUTIVE_LATEST.md");
  mkdirSync(adapter.evidenceDir, { recursive: true });
  writeFileSync(
    execPath,
    [
      `# DeepMatch QA Executive — ${report.context.runId}`,
      ``,
      `GA stance: **${report.gaStance}** (recommendation only)`,
      `Release recommendation: ${report.releaseRecommendation}`,
      `Lifecycle effect: ${report.lifecycleEffect ?? "none"}`,
      ``,
      `| PASS | FAIL | BLOCKED | SKIPPED | INCONCLUSIVE | Total |`,
      `|-----:|-----:|--------:|--------:|-------------:|------:|`,
      `| ${report.summary.pass} | ${report.summary.fail} | ${report.summary.blocked} | ${report.summary.skipped} | ${report.summary.inconclusive} | ${report.summary.total} |`,
      ``,
      `Regression vs baseline: ${regression.join("; ") || "n/a"}`,
      `Sheet 53: ${sheetApply}${proposed.path ? ` · proposed ${proposed.path}` : ""}${narrowPlanPath ? ` · narrow ${narrowPlanPath}` : ""}`,
      `Evidence: ${jsonPath}`,
      `Duration: ${report.durationMs}ms`,
      ``,
      `Open blockers:`,
      ...(report.openBlockers.length
        ? report.openBlockers.map((b) => `- ${b}`)
        : ["- none"]),
      ``,
      `Next: human independent review required before any VERIFIED/GA GO.`,
      ``,
    ].join("\n"),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        runId: report.context.runId,
        summary: report.summary,
        lifecycleEffect: report.lifecycleEffect,
        gaStance: report.gaStance,
        jsonPath,
        mdPath,
        execPath,
        sheet: sheetApply,
        narrowPlanPath: narrowPlanPath ?? null,
        regression,
      },
      null,
      2,
    ),
  );

  if (report.summary.fail > 0) process.exit(2);
  if (report.summary.blocked > 0 && report.summary.pass === 0) process.exit(3);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
