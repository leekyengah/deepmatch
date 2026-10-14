/**
 * Regression guard for AUD-043: workspace packages must resolve for apps/web.
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireFromWeb = createRequire(resolve(root, "apps/web/package.json"));
const failures = [];

const pkgs = ["@deepmatch/shared", "@deepmatch/i18n", "@deepmatch/legal-content"];

for (const name of pkgs) {
  const nm = resolve(root, "node_modules", ...name.split("/"));
  const webNm = resolve(root, "apps/web/node_modules", ...name.split("/"));
  const linked = existsSync(nm) || existsSync(webNm);
  if (!linked) {
    failures.push(`${name}: not linked under node_modules (run npm install from repo root)`);
    continue;
  }
  try {
    const entry = requireFromWeb.resolve(name);
    console.log(`OK ${name} → ${entry}`);
  } catch (err) {
    failures.push(
      `${name}: createRequire resolve failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  try {
    const real = realpathSync(existsSync(nm) ? nm : webNm);
    if (!real.includes(`${"packages"}${require("node:path").sep}`) && !real.includes("packages/")) {
      // On Windows realpath may use backslashes; accept either packages path
      if (!/packages[\\/]/.test(real)) {
        failures.push(`${name}: expected workspace link into packages/*, got ${real}`);
      }
    }
  } catch {
    // ignore realpath edge cases on some CI mounts
  }
}

const webVercelPath = resolve(root, "apps/web/vercel.json");
if (!existsSync(webVercelPath)) {
  failures.push("apps/web/vercel.json missing");
} else {
  const cfg = JSON.parse(readFileSync(webVercelPath, "utf8"));
  const install = String(cfg.installCommand || "");
  const build = String(cfg.buildCommand || "");
  if (!install.includes("cd ../..")) {
    failures.push(
      "apps/web/vercel.json installCommand must `cd ../..` so npm workspaces link (AUD-043)",
    );
  }
  if (!build.includes("vercel-build")) {
    failures.push(
      "apps/web/vercel.json buildCommand must invoke root vercel-build:* (not bare next build)",
    );
  }
  console.log("OK apps/web/vercel.json monorepo install/build");
}

const rootPkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
if (!rootPkg.scripts?.["vercel-build"] || !rootPkg.scripts?.["vercel-build:web"]) {
  failures.push("root package.json must define vercel-build and vercel-build:web");
} else {
  console.log("OK root vercel-build scripts");
}

if (failures.length) {
  console.error("FAIL check:workspace-resolution");
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}

console.log("PASS check:workspace-resolution");
