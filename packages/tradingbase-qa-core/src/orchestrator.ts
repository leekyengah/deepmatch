import { execSync } from "node:child_process";
import type {
  CaseResult,
  EnvironmentTarget,
  QaRunReport,
  SafetyPolicy,
  TestCaseSpec,
} from "./types.js";
import { assertEnvironmentAllowed, SafetyViolation } from "./safety.js";
import {
  buildReport,
  newRunId,
  writeEvidence,
  loadBaseline,
  diffSummaries,
} from "./evidence.js";
import { lifecycleFromResults } from "./status-machine.js";

export type CaseRunner = (
  spec: TestCaseSpec,
  ctx: { environment: EnvironmentTarget; projectRoot: string },
) => Promise<CaseResult>;

export interface OrchestratorInput {
  projectId: string;
  suite: string;
  cases: TestCaseSpec[];
  environment: EnvironmentTarget;
  policy: SafetyPolicy;
  projectRoot: string;
  evidenceDir: string;
  actor?: string;
  runners: Record<string, CaseRunner>;
  baselinePath?: string;
  costEstimateUsd?: number;
}

function gitMeta(cwd: string): { sha: string; branch: string } {
  try {
    const sha = execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf8",
    }).trim();
    return { sha, branch };
  } catch {
    return { sha: "unknown", branch: "unknown" };
  }
}

export async function runOrchestrator(
  input: OrchestratorInput,
): Promise<{ report: QaRunReport; jsonPath: string; mdPath: string; regression: string[] }> {
  const started = Date.now();
  const runId = newRunId();
  const { sha, branch } = gitMeta(input.projectRoot);
  const results: CaseResult[] = [];
  const openBlockers: string[] = [];

  try {
    assertEnvironmentAllowed(input.environment, input.policy);
  } catch (err) {
    const msg = err instanceof SafetyViolation ? err.message : String(err);
    openBlockers.push(msg);
    for (const spec of input.cases) {
      results.push({
        id: spec.id,
        outcome: "BLOCKED",
        detail: msg,
        failureClass: "environment_blocked",
        requirements: spec.requirements,
        expected: spec.criteria,
      });
    }
  }

  if (!openBlockers.length) {
    for (const spec of input.cases) {
      if (input.suite !== "all" && spec.suite !== input.suite && input.suite !== "p0") {
        /* suite filter below */
      }
      const suiteMatch =
        input.suite === "all" ||
        spec.suite === input.suite ||
        (input.suite === "p0" &&
          spec.priority === "P0" &&
          (spec.suite === "p0" ||
            spec.suite === "unit" ||
            spec.suite === "staging-accept")) ||
        (input.suite === "w2" &&
          (spec.suite === "w2" || (spec.tags ?? []).includes("w2"))) ||
        (input.suite === "w3" &&
          (spec.suite === "w3" || (spec.tags ?? []).includes("w3")));
      if (!suiteMatch) {
        results.push({
          id: spec.id,
          outcome: "SKIPPED",
          detail: `suite filter ${input.suite}`,
          requirements: spec.requirements,
        });
        continue;
      }
      const runner = input.runners[spec.runner];
      if (!runner) {
        results.push({
          id: spec.id,
          outcome: "BLOCKED",
          detail: `missing runner ${spec.runner}`,
          failureClass: "test_infrastructure",
          requirements: spec.requirements,
          expected: spec.criteria,
        });
        continue;
      }
      const t0 = Date.now();
      try {
        const result = await runner(spec, {
          environment: input.environment,
          projectRoot: input.projectRoot,
        });
        results.push({
          ...result,
          durationMs: result.durationMs ?? Date.now() - t0,
          requirements: result.requirements ?? spec.requirements,
          expected: result.expected ?? spec.criteria,
        });
      } catch (err) {
        results.push({
          id: spec.id,
          outcome: "INCONCLUSIVE",
          detail: String(err),
          failureClass: "test_infrastructure",
          durationMs: Date.now() - t0,
          requirements: spec.requirements,
          expected: spec.criteria,
        });
      }
    }
  }

  const executed = results.filter((r) => r.outcome !== "SKIPPED" && r.outcome !== "NOT_RUN");
  const lifecycleEffect = lifecycleFromResults({
    ran: executed.length > 0,
    anyFail: results.some((r) => r.outcome === "FAIL"),
    anyBlocked: results.some((r) => r.outcome === "BLOCKED"),
    allPass:
      executed.length > 0 && executed.every((r) => r.outcome === "PASS"),
  });

  const baseline = input.baselinePath
    ? loadBaseline(input.baselinePath)
    : loadBaseline(`${input.evidenceDir}/LATEST.json`);

  const report = buildReport({
    context: {
      runId,
      projectId: input.projectId,
      commitSha: sha,
      branch,
      environment: input.environment,
      startedAt: new Date(started).toISOString(),
      suite: input.suite,
      actor: input.actor ?? "qa-agent-automated",
    },
    results,
    openBlockers,
    durationMs: Date.now() - started,
    lifecycleEffect,
    costEstimateUsd: input.costEstimateUsd,
  });

  const { jsonPath, mdPath } = writeEvidence(report, input.evidenceDir);
  const regression = diffSummaries(baseline, report);

  return { report, jsonPath, mdPath, regression };
}
