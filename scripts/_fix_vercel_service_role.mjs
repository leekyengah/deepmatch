import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const scope = "tradingbase";
const project = "deepmatch";
const envFile = "apps/web/.env.local";

const vals = {};
for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
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

const service = vals.SUPABASE_SERVICE_ROLE_KEY;
if (!service?.startsWith("eyJ") || service.length < 100) {
  console.error("invalid service role in local env");
  process.exit(1);
}

try {
  execSync(
    `npx vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes --scope ${scope} --project ${project}`,
    { stdio: "ignore" },
  );
} catch {
  /* ok */
}

execSync(
  `npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --type secret --value ${JSON.stringify(service)} --yes --scope ${scope} --project ${project}`,
  { stdio: "inherit", shell: true },
);
console.log("service_role set len", service.length);
