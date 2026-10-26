import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAdapter, FUTURE_PROJECT_STUBS } from "@tradingbase/qa-adapters";
import { runOrchestrator } from "@tradingbase/qa-core";
import { registerDeepMatchAdapter, resolveMonorepoRoot } from "./adapter.js";
import { proposeSheet53Updates } from "./sheet-propose.js";
import { readHistoricalPairPinsRootCause } from "./runners/index.js";

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = { suite: "unit" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--suite") out.suite = argv[++i] ?? "unit";
    else if (a === "--env") out.env = argv[++i] ?? "dm-staging";
    else if (a === "--seed") out.seed = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--list-projects") out.list = true;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`DeepMatch QA adapter CLI

  npm run qa:deepmatch -- --suite unit|p0|staging-accept|all
  npm run qa:deepmatch -- --suite p0 --env dm-staging
  npm run qa:deepmatch -- --seed --suite p0

Safety: production writes forbidden. Sheets write disabled by default.
GA stance remains NO-GO until human release gates pass.
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
    console.log(seeded.ok ? `SEED OK — ${seeded.detail}` : `SEED FAIL — ${seeded.detail}`);
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
      `Sheet 53: ${proposed.status}${proposed.path ? ` → ${proposed.path}` : ""}`,
      `Evidence: ${jsonPath}`,
      `Duration: ${report.durationMs}ms · Est. incremental cost: $0 (reuse existing runners)`,
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
        sheet: proposed.status,
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
