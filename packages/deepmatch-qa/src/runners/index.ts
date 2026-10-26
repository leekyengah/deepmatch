import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { CaseRunner } from "@tradingbase/qa-core";
import { hasQaCreds, loadQaEnv, runCommand } from "./shell.js";

function nodeEnvFileArgs(projectRoot: string): string[] {
  const envLocal = join(projectRoot, ".env.local");
  return existsSync(envLocal) ? ["--env-file=.env.local"] : [];
}

function classifyPairPinsFail(detail: string): {
  failureClass: "seed_fixture" | "application_defect" | "unknown";
  remediation: string;
} {
  if (/A=0\s*B=0/.test(detail)) {
    return {
      failureClass: "seed_fixture",
      remediation:
        "Re-run seed-qa-pair.mjs (idempotent three-layer pins). Root cause historically: pair_id drift / missing pin seed before accept. See docs/evidence/remediation-w1-2026-10-26/QA-ACCEPT-STAGING-2026-10-26.json vs RERUN-13-13.",
    };
  }
  if (/LEAK|denied/.test(detail)) {
    return {
      failureClass: "application_defect",
      remediation: "Investigate pins RLS policies for pair members",
    };
  }
  return {
    failureClass: "unknown",
    remediation: "Capture pins select for A/B + admin count for pair_id",
  };
}

export const runners: Record<string, CaseRunner> = {
  qa_core_unit: async (spec, ctx) => {
    const core = await runCommand(
      "npm",
      ["run", "test", "-w", "@tradingbase/qa-core"],
      { cwd: ctx.projectRoot, timeoutMs: 120_000 },
    );
    const adapters = await runCommand(
      "npm",
      ["run", "test", "-w", "@tradingbase/qa-adapters"],
      { cwd: ctx.projectRoot, timeoutMs: 60_000 },
    );
    const ok = core.code === 0 && adapters.code === 0;
    return {
      id: spec.id,
      outcome: ok ? "PASS" : "FAIL",
      actual: `core=${core.code} adapters=${adapters.code}`,
      detail: [core.stdout, adapters.stdout].join("\n").slice(-2000),
      failureClass: ok ? undefined : "test_infrastructure",
    };
  },

  accept_staging: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials (seed-qa-pair / qa.env.ps1)",
        failureClass: "environment_blocked",
      };
    }
    const r = await runCommand(
      "node",
      [...nodeEnvFileArgs(ctx.projectRoot), "scripts/accept-staging.mjs"],
      {
        cwd: ctx.projectRoot,
        env: { E2E_BASE_URL: ctx.environment.baseUrl },
        timeoutMs: 180_000,
      },
    );
    const failed = /FAILED:\s*(.+)/.exec(r.stdout + r.stderr);
    const summary = /Summary:\s*(\d+)\/(\d+)/.exec(r.stdout);
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: summary ? `${summary[1]}/${summary[2]}` : `exit=${r.code}`,
      detail: failed?.[1] ?? (r.stderr.slice(-500) || r.stdout.slice(-500)),
      failureClass: r.code === 0 ? undefined : "application_defect",
      remediation:
        r.code === 0
          ? undefined
          : "Report to Developer; do not patch product to greenwash",
    };
  },

  accept_pair_pins: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials",
        failureClass: "environment_blocked",
      };
    }
    const r = await runCommand(
      "node",
      [...nodeEnvFileArgs(ctx.projectRoot), "scripts/accept-staging.mjs"],
      {
        cwd: ctx.projectRoot,
        env: { E2E_BASE_URL: ctx.environment.baseUrl },
        timeoutMs: 180_000,
      },
    );
    const line =
      (r.stdout + r.stderr)
        .split(/\r?\n/)
        .find((l) => l.includes("pair_pins_three_layers")) ?? "";
    const pass = /^PASS/.test(line) || (r.code === 0 && /pair_pins_three_layers/.test(r.stdout));
    const failLine = /FAIL\s+pair_pins_three_layers\s*—\s*(.*)/.exec(line);
    if (pass && !failLine) {
      return {
        id: spec.id,
        outcome: "PASS",
        actual: line || "accept suite exit 0",
      };
    }
    const detail = failLine?.[1] ?? (line || `exit=${r.code}`);
    const cls = classifyPairPinsFail(detail);
    return {
      id: spec.id,
      outcome: "FAIL",
      actual: detail,
      failureClass: cls.failureClass,
      remediation: cls.remediation,
    };
  },

  probe_pin_id: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials",
        failureClass: "environment_blocked",
      };
    }
    const r = await runCommand(
      "node",
      [...nodeEnvFileArgs(ctx.projectRoot), "scripts/probe-pin-id-staging.mjs"],
      { cwd: ctx.projectRoot, timeoutMs: 120_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-800),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  probe_pin_visibility: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing QA credentials",
        failureClass: "environment_blocked",
      };
    }
    const r = await runCommand(
      "node",
      [
        ...nodeEnvFileArgs(ctx.projectRoot),
        "scripts/probe-pin-visibility-staging.mjs",
      ],
      { cwd: ctx.projectRoot, timeoutMs: 120_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-800),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  no_leak_public: async (spec, ctx) => {
    const r = await runCommand(
      "npm",
      ["run", "test:no-leak", "--", ctx.environment.baseUrl],
      { cwd: ctx.projectRoot, timeoutMs: 120_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-800),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  ext_evidence_eval: async (spec, ctx) => {
    const script = join(ctx.projectRoot, "scripts/eval-ext-done-evidence.mjs");
    if (!existsSync(script)) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "eval-ext-done-evidence.mjs missing",
        failureClass: "test_infrastructure",
      };
    }
    const r = await runCommand("node", [script], {
      cwd: ctx.projectRoot,
      timeoutMs: 60_000,
    });
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-1000),
      failureClass: r.code === 0 ? undefined : "test_infrastructure",
      remediation: "Do not auto-mark EXT Done as VERIFIED",
    };
  },

  rls_deny: async (spec, ctx) => {
    loadQaEnv(ctx.projectRoot);
    if (!hasQaCreds()) {
      return {
        id: spec.id,
        outcome: "BLOCKED",
        detail: "Missing staging JWTs for RLS harness",
        failureClass: "environment_blocked",
      };
    }
    const r = await runCommand(
      "npx",
      ["tsx", "--test", "tests/integration/rls-deny.test.ts"],
      { cwd: ctx.projectRoot, timeoutMs: 120_000 },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-800),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },

  playwright_smoke: async (spec, ctx) => {
    const r = await runCommand(
      "npx",
      ["playwright", "test", "tests/e2e/smoke.spec.ts", "--reporter=list"],
      {
        cwd: ctx.projectRoot,
        env: { E2E_BASE_URL: ctx.environment.baseUrl },
        timeoutMs: 180_000,
      },
    );
    return {
      id: spec.id,
      outcome: r.code === 0 ? "PASS" : "FAIL",
      actual: (r.stdout || r.stderr).slice(-1000),
      failureClass: r.code === 0 ? undefined : "application_defect",
    };
  },
};

export function readHistoricalPairPinsRootCause(projectRoot: string): string {
  const failPath = join(
    projectRoot,
    "docs/evidence/remediation-w1-2026-10-26/QA-ACCEPT-STAGING-2026-10-26.json",
  );
  const passPath = join(
    projectRoot,
    "docs/evidence/remediation-w1-2026-10-26/QA-ACCEPT-STAGING-RERUN-13-13.json",
  );
  const notes: string[] = [];
  if (existsSync(failPath)) {
    const j = JSON.parse(readFileSync(failPath, "utf8")) as {
      failed?: string[];
      results?: Array<{ id: string; detail?: string }>;
    };
    const pin = j.results?.find((r) => r.id === "pair_pins_three_layers");
    notes.push(
      `Historical FAIL ${failPath}: ${pin?.detail ?? j.failed?.join(",")}`,
    );
  }
  if (existsSync(passPath)) {
    const j = JSON.parse(readFileSync(passPath, "utf8")) as {
      passed?: number;
      total?: number;
      results?: Array<{ id: string; detail?: string }>;
    };
    const pin = j.results?.find((r) => r.id === "pair_pins_three_layers");
    notes.push(
      `Historical PASS after reseed ${passPath}: ${pin?.detail} (${j.passed}/${j.total})`,
    );
  }
  return notes.join(" | ");
}
