/**
 * Vercel build entry for @deepmatch/web (monorepo-safe).
 * Always run from repository root so npm workspaces resolve @deepmatch/*.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, cwd: root });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// Guard: packages must exist in the deployment file set
for (const p of [
  "packages/shared/package.json",
  "packages/i18n/package.json",
  "packages/legal-content/package.json",
  "apps/web/package.json",
]) {
  if (!existsSync(resolve(root, p))) {
    console.error(`AUD-043: missing ${p} — Vercel Root Directory / ignore misconfigured`);
    process.exit(1);
  }
}

run("node", ["scripts/check-workspace-resolution.mjs"]);

// Compile shared (declaration emit); Next transpilePackages still consumes TS sources.
run("npm", ["run", "build", "-w", "@deepmatch/shared"]);
run("npm", ["run", "build", "-w", "@deepmatch/web"]);

// Prove Next can resolve workspace package entrypoints after build graph
const requireFromWeb = createRequire(resolve(root, "apps/web/package.json"));
for (const name of ["@deepmatch/shared", "@deepmatch/i18n", "@deepmatch/legal-content"]) {
  const entry = requireFromWeb.resolve(name);
  console.log(`resolved post-build: ${name} → ${entry}`);
}

console.log("vercel-build:web OK");
