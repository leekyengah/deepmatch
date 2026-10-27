/**
 * Staging security probes — no secrets printed.
 * Loads apps/web/.env.local + optional QA password from qa-matrix.env.ps1
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const BASE = (process.env.E2E_BASE_URL || "https://datingvn.com").replace(/\/$/, "");
const outDir = "docs/evidence/audit-2026-10-13/phase2";
mkdirSync(outDir, { recursive: true });

function parseEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    out[line.slice(0, i).trim()] = v;
  }
  return out;
}

function parsePs(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/\$env:([A-Z0-9_]+)\s*=\s*['"](.+?)['"]\s*$/i);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const local = { ...parseEnv(".env.local"), ...parseEnv("apps/web/.env.local") };
const qa = { ...parsePs(".ai/e2e.env.ps1"), ...parsePs(".ai/qa-matrix.env.ps1") };
const url = local.NEXT_PUBLIC_SUPABASE_URL;
const anon = local.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = qa.E2E_EMAIL || qa.QA_USER_01_EMAIL || "qa_user01@deepmatch.test";
const password = qa.E2E_PASSWORD || qa.QA_PASSWORD;

const findings = [];

async function check(name, fn) {
  try {
    const r = await fn();
    findings.push({ name, ...r });
  } catch (e) {
    findings.push({ name, status: "ERROR", detail: String(e.message || e) });
  }
}

await check("private_html_discover_redirect", async () => {
  const res = await fetch(`${BASE}/discover`, { redirect: "manual" });
  const loc = res.headers.get("location") || "";
  const ok = res.status >= 300 && res.status < 400 && loc.includes("/login");
  return { status: ok ? "PASS" : "FAIL", detail: `${res.status} loc=${loc}` };
});

await check("public_legal_200", async () => {
  const res = await fetch(`${BASE}/legal`);
  return { status: res.status === 200 ? "PASS" : "FAIL", detail: `status=${res.status}` };
});

await check("api_profile_unauth_401", async () => {
  const res = await fetch(`${BASE}/api/v1/me/profile`);
  return { status: res.status === 401 ? "PASS" : "FAIL", detail: `status=${res.status}` };
});

await check("sandbox_webhook_no_secret_or_bad_sig", async () => {
  const res = await fetch(`${BASE}/api/v1/checkout/webhooks/sandbox`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-deepmatch-signature": "deadbeef" },
    body: JSON.stringify({ event_id: "probe", type: "paid", order_id: "00000000-0000-0000-0000-000000000000" }),
  });
  // 503 not configured OR 400 invalid signature — both acceptable hardening
  const ok = res.status === 400 || res.status === 503;
  return { status: ok ? "PASS" : "FAIL", detail: `status=${res.status}` };
});

await check("stripe_webhook_bad_sig", async () => {
  const res = await fetch(`${BASE}/api/v1/payments/webhooks/stripe`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=dead" },
    body: "{}",
  });
  const ok = res.status === 400 || res.status === 503 || res.status === 500;
  return { status: ok ? "PASS" : "FAIL", detail: `status=${res.status}` };
});

if (url && anon && password) {
  await check("password_grant_qa", async () => {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));
    const token = body.access_token;
    const ok = res.ok && Boolean(token);
    if (ok) {
      const media = await fetch(`${BASE}/api/v1/media/library`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foreign = await fetch(
        `${BASE}/api/v1/media/00000000-0000-0000-0000-000000000001/url`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        status: "PASS",
        detail: `login_ok media_library=${media.status} foreign_media_url=${foreign.status}`,
      };
    }
    return { status: "FAIL", detail: `login status=${res.status}` };
  });
} else {
  findings.push({
    name: "password_grant_qa",
    status: "BLOCKED",
    detail: "missing local supabase anon or QA password",
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  findings,
  pass: findings.filter((f) => f.status === "PASS").length,
  fail: findings.filter((f) => f.status === "FAIL").length,
  blocked: findings.filter((f) => f.status === "BLOCKED").length,
};
writeFileSync(`${outDir}/security-probes.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ pass: summary.pass, fail: summary.fail, blocked: summary.blocked, findings }, null, 2));
process.exit(summary.fail ? 2 : 0);
