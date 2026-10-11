/**
 * Creates/deploys deepmatch-web + deepmatch-admin on Vercel after CLI login.
 * Usage: node scripts/deploy-vercel.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function run(cmd, cwd = process.cwd()) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function parseEnvLocal() {
  const p = resolve("apps/web/.env.local");
  if (!existsSync(p)) throw new Error("Missing apps/web/.env.local");
  const map = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    map[line.slice(0, i)] = line.slice(i + 1);
  }
  return map;
}

const who = run("npx --yes vercel@39 whoami").trim();
console.log("Vercel user:", who);

const env = parseEnvLocal();
const envFlags = [
  ["NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ["NEXT_PUBLIC_APP_ENV", "staging"],
  ["FF_MATCHING", "true"],
  ["FF_CHAT", "true"],
  ["FF_MEDIA_UPLOAD", "true"],
  ["FF_CONCIERGE", "false"],
  ["FF_DISCOVERY", "true"],
  ["MIN_AGE", "18"],
];

for (const app of ["web", "admin"]) {
  const cwd = resolve(`apps/${app}`);
  const name = `deepmatch-${app}`;
  console.log(`\n=== Deploy ${name} ===`);
  run(
    `npx --yes vercel@39 link --yes --project ${name} --scope ${who.replace(/^.*\s/, "")}`,
    cwd,
  ).catch?.(() => {});
  // link may need: vercel project add
  try {
    run(`npx --yes vercel@39 project add ${name}`, cwd);
  } catch {
    /* may already exist */
  }
  for (const [k, v] of envFlags) {
    if (!v) continue;
    try {
      run(
        `npx --yes vercel@39 env add ${k} production <<< "${v.replace(/"/g, '\\"')}"`,
        cwd,
      );
    } catch {
      /* env set best-effort; Windows uses different piping below */
    }
  }
  const out = run(`npx --yes vercel@39 deploy --yes --prod`, cwd);
  console.log(out);
}

console.log("\nDone. Set NEXT_PUBLIC_APP_URL / ADMIN_URL to deployment URLs in Supabase Auth redirect settings.");
