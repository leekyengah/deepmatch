/**
 * Set env vars on a Vercel project from .ai/prod.env.ps1 (or path arg).
 *   node scripts/set-vercel-env.mjs deepmatch-prod
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const project = process.argv[2] || "deepmatch-prod";
const envFile = process.argv[3] || ".ai/prod.env.ps1";
const scope = process.env.VERCEL_SCOPE || "tradingbase";

const raw = readFileSync(envFile, "utf8");
const pairs = [];
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\$env:([A-Z0-9_]+)="(.*)"$/);
  if (m) pairs.push([m[1], m[2]]);
}

for (const [key, value] of pairs) {
  try {
    execSync(
      `npx vercel env rm ${key} production --yes --scope ${scope}`,
      { stdio: "ignore", cwd: process.cwd() },
    );
  } catch {
    /* may not exist */
  }
  try {
    execSync(
      `npx vercel env add ${key} production --scope ${scope}`,
      {
        input: `${value}\n`,
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    console.log("set", key);
  } catch (e) {
    console.error("fail", key, e instanceof Error ? e.message : e);
  }
}

console.log("done", project, pairs.length, "keys");
