/**
 * Sync Supabase env from apps/web/.env.local → Vercel production (deepmatch).
 * Usage: node scripts/_fix_vercel_supabase_keys.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const scope = "tradingbase";
const project = "deepmatch";
const envFile = "apps/web/.env.local";

const publicKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
const secretKeys = ["SUPABASE_SERVICE_ROLE_KEY"];

function parseEnv(path) {
  const vals = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    vals[k] = v;
  }
  return vals;
}

function rm(key) {
  try {
    execSync(
      `npx vercel env rm ${key} production --yes --scope ${scope} --project ${project}`,
      { stdio: "ignore" },
    );
  } catch {
    /* may not exist */
  }
}

function add(key, value, type) {
  // Prefer --value to avoid interactive prompts on newer Vercel CLI
  execSync(
    `npx vercel env add ${key} production --type ${type} --value ${JSON.stringify(value)} --yes --scope ${scope} --project ${project}`,
    { stdio: "inherit", shell: true },
  );
  console.log("set", key, "type", type, "len", value.length);
}

const vals = parseEnv(envFile);
const url = vals.NEXT_PUBLIC_SUPABASE_URL;
const anon = vals.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = vals.SUPABASE_SERVICE_ROLE_KEY;

if (!url?.includes("zzqpvjdyvjarpphqhaze") || !anon?.startsWith("eyJ")) {
  console.error("Local web .env.local missing expected Supabase URL/anon");
  process.exit(1);
}
if (!service?.startsWith("eyJ") || service.length < 100) {
  console.error("Local web .env.local missing valid SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (
  !vals.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  vals.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length < 80
) {
  vals.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = anon;
}

for (const key of publicKeys) {
  rm(key);
  // NEXT_PUBLIC_* must be type=config so the browser can read them at build/runtime
  add(key, vals[key], "config");
}

for (const key of secretKeys) {
  rm(key);
  add(key, vals[key], "secret");
}

console.log("done — redeploy required");
