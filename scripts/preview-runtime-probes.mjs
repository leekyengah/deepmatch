/**
 * Probe a Vercel Preview via `vercel curl` (bypasses Deployment Protection).
 * Usage: node scripts/preview-runtime-probes.mjs <preview-base-url>
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const base = (process.argv[2] || "").replace(/\/$/, "");
if (!base) {
  console.error("Usage: node scripts/preview-runtime-probes.mjs <preview-url>");
  process.exit(1);
}

function vercelCurl(path) {
  const url = `${base}${path}`;
  const r = spawnSync(
    "npx",
    ["vercel", "curl", url, "--", "-sS", "-D", "-", "-o", "-"],
    { encoding: "utf8", shell: true },
  );
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  const statusMatch = out.match(/HTTP\/[\d.]+\s+(\d+)/);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const locMatch = out.match(/^(?:location|Location):\s*(.+)$/m);
  const location = locMatch ? locMatch[1].trim() : "";
  // body after blank line
  const parts = out.split(/\r?\n\r?\n/);
  const body = parts.slice(1).join("\n\n");
  return { status, location, body, raw: out.slice(0, 2000) };
}

const paths = [
  { path: "/api/v1/health", expect: (r) => r.status === 200 && /"ok"\s*:\s*true/.test(r.body) },
  { path: "/", expect: (r) => r.status === 200 },
  { path: "/login", expect: (r) => r.status === 200 },
  { path: "/legal", expect: (r) => r.status === 200 },
  {
    path: "/discover",
    expect: (r) =>
      (r.status === 307 || r.status === 302) && /\/login/.test(r.location),
  },
  {
    path: "/chat",
    expect: (r) =>
      (r.status === 307 || r.status === 302) && /\/login/.test(r.location),
  },
  {
    path: "/me",
    expect: (r) =>
      (r.status === 307 || r.status === 302) && /\/login/.test(r.location),
  },
];

const results = [];
let fail = 0;
for (const p of paths) {
  const r = vercelCurl(p.path);
  const ok = p.expect(r);
  if (!ok) fail += 1;
  results.push({
    path: p.path,
    status: r.status,
    location: r.location,
    pass: ok,
    bodySnippet: r.body.slice(0, 240).replace(/\s+/g, " "),
  });
  console.log(`${ok ? "PASS" : "FAIL"} ${p.path} → ${r.status} ${r.location}`);
}

const outDir = resolve("docs/evidence/audit-2026-10-13/phase3");
mkdirSync(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  base,
  fail,
  pass: results.length - fail,
  results,
};
writeFileSync(resolve(outDir, "preview-runtime-probes.json"), JSON.stringify(report, null, 2));
console.log(fail ? `FAIL ${fail}` : `PASS ${results.length}/${results.length}`);
process.exit(fail ? 1 : 0);
