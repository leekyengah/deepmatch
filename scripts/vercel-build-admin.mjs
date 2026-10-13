/**
 * Vercel build entry for @deepmatch/admin (monorepo-safe).
 */
import { spawnSync } from "node:child_process";
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

for (const p of [
  "packages/shared/package.json",
  "packages/i18n/package.json",
  "apps/admin/package.json",
]) {
  if (!existsSync(resolve(root, p))) {
    console.error(`AUD-043: missing ${p}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-workspace-resolution.mjs"]);
run("npm", ["run", "build", "-w", "@deepmatch/shared"]);
run("npm", ["run", "build", "-w", "@deepmatch/admin"]);
console.log("vercel-build:admin OK");
