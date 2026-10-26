import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProjectAdapter } from "@tradingbase/qa-adapters";
import { registerAdapter } from "@tradingbase/qa-adapters";
import type { TestCaseSpec } from "@tradingbase/qa-core";
import { runners } from "./runners/index.js";
import { loadQaEnv, runCommand } from "./runners/shell.js";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");

export function resolveMonorepoRoot(): string {
  return process.env.DEEPMATCH_ROOT || join(pkgRoot, "../..");
}

export function loadCatalog(): TestCaseSpec[] {
  const raw = JSON.parse(
    readFileSync(join(pkgRoot, "catalog/catalog.json"), "utf8"),
  ) as { cases: TestCaseSpec[] };
  return raw.cases;
}

export function createDeepMatchAdapter(
  projectRoot = resolveMonorepoRoot(),
): ProjectAdapter {
  return {
    projectId: "deepmatch",
    displayName: "DeepMatch",
    projectRoot,
    safety: {
      projectId: "deepmatch",
      allowedHosts: [
        "datingvn.com",
        "localhost",
        "127.0.0.1",
        "www.datingvn.com",
      ],
      allowedKinds: ["staging", "isolated", "local"],
      forbidProductionWrites: true,
      forbidLivePsp: true,
    },
    environments: [
      {
        id: "dm-staging",
        baseUrl: process.env.E2E_BASE_URL || "https://datingvn.com",
        kind: "staging",
        allowWrites: false,
      },
      {
        id: "dm-local",
        baseUrl: "http://127.0.0.1:3000",
        kind: "local",
        allowWrites: false,
      },
    ],
    defaultEnvironmentId: "dm-staging",
    catalog: loadCatalog(),
    runners,
    evidenceDir: join(projectRoot, "docs/evidence/qa-agent"),
    tracker: {
      kind: "google_sheets",
      spreadsheetId: "1R_de74Szc0xbPZEJpXcoKrNrX5QESi39FYBRESDm6D8",
      sheetNames: [
        "52 CURSOR PROGRESS AUDIT Q&A",
        "53 REMEDIATION EXECUTION PLAN",
      ],
      qaOwnedFields: ["QA độc lập", "Evidence mới / commit / test", "Ghi chú"],
      writeEnabled: false,
    },
    seed: async () => {
      loadQaEnv(projectRoot);
      const args = existsSync(join(projectRoot, ".env.local"))
        ? ["--env-file=.env.local", "scripts/seed-qa-pair.mjs"]
        : ["scripts/seed-qa-pair.mjs"];
      const r = await runCommand("node", args, {
        cwd: projectRoot,
        timeoutMs: 180_000,
      });
      return {
        ok: r.code === 0,
        detail:
          r.code === 0 ? "seed-qa-pair ok" : (r.stderr || r.stdout).slice(-400),
      };
    },
  };
}

export function registerDeepMatchAdapter(projectRoot?: string): ProjectAdapter {
  const adapter = createDeepMatchAdapter(projectRoot);
  registerAdapter(adapter, {
    projectId: "deepmatch",
    enabled: true,
    allowExecution: true,
    notes: "DeepMatch pilot V1.0 — staging allowlisted",
  });
  return adapter;
}
