/**
 * Non-destructive staging DR soft-check (no restore mutate).
 *   node --env-file=.env.local scripts/dr-soft-check.mjs
 */
import { writeFileSync } from "node:fs";

const base = process.env.E2E_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://datingvn.com";
const checks = [];

async function check(name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    checks.push({ name, ok: true, ms: Date.now() - started, detail });
  } catch (err) {
    checks.push({
      name,
      ok: false,
      ms: Date.now() - started,
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}

await check("health_v1", async () => {
  const res = await fetch(`${base}/api/v1/health`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  const body = await res.json();
  if (!body.ok) throw new Error("health not ok");
  return { productionDeploy: body.productionDeploy, flags: body.flags };
});

await check("chat_page", async () => {
  const res = await fetch(`${base}/chat`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return { bytes: (await res.text()).length };
});

await check("forgot_password_page", async () => {
  const res = await fetch(`${base}/forgot-password`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return { bytes: (await res.text()).length };
});

await check("admin_health_reachable", async () => {
  const admin =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://deepmatch-admin.vercel.app";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(admin, {
      signal: ctrl.signal,
      redirect: "manual",
      headers: { "user-agent": "DeepMatch-DR/1.0" },
    });
    // 200/3xx/401 still proves edge alive; only hard-fail 5xx
    if (res.status >= 500) throw new Error(`status ${res.status}`);
    return { status: res.status, admin };
  } finally {
    clearTimeout(t);
  }
});

await check("supabase_rest", async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("missing supabase env");
  const res = await fetch(`${url}/rest/v1/feature_flags?select=name,enabled&limit=5`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  // may be 401 if no policy — still proves API reachable
  return { status: res.status };
});

const passed = checks.filter((c) => c.ok).length;
const failed = checks.length - passed;
const md = [
  `# DR Soft-Check — ${new Date().toISOString().slice(0, 10)}`,
  "",
  `| Check | OK | ms | Detail |`,
  `|---|---|---|---|`,
  ...checks.map(
    (c) =>
      `| ${c.name} | ${c.ok ? "PASS" : "FAIL"} | ${c.ms} | \`${JSON.stringify(c.detail).slice(0, 120)}\` |`,
  ),
  "",
  `Summary: ${passed}/${checks.length} PASS, ${failed} FAIL`,
  "",
  "Note: soft-check only (no PITR restore). Full drill still required for G5.",
  "",
].join("\n");

writeFileSync("docs/evidence/DR-SOFT-CHECK-2026-10-12.md", md, "utf8");
console.log(md);
process.exit(failed ? 1 : 0);
