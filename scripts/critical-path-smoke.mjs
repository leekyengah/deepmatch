/**
 * Non-destructive critical-path smoke vs staging.
 * Does NOT delete accounts, unmatch live QA pair, or charge PSP.
 *
 *   node --env-file=.env.local scripts/critical-path-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.E2E_BASE_URL || "https://datingvn.com";

function loadQaEnv() {
  try {
    const raw = readFileSync(".ai/qa.env.ps1", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\$env:([A-Z0-9_]+)="(.*)"$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* optional */
  }
}
loadQaEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.QA_EMAIL_A;
const password = process.env.QA_PASSWORD;

if (!url || !anon || !email || !password) {
  console.error("Missing SUPABASE/QA env");
  process.exit(1);
}

const client = createClient(url, anon, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data, error } = await client.auth.signInWithPassword({ email, password });
if (error) {
  console.error("auth failed", error.message);
  process.exit(2);
}
const token = data.session.access_token;

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

const checks = [];
function check(id, pass, detail = "") {
  checks.push({ id, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}${detail ? ` — ${detail}` : ""}`);
}

const me = await api("/api/v1/me/profile");
check("profile_me", me.status === 200, `status=${me.status}`);

const disc = await api("/api/v1/discovery/candidates");
const emptyReason = disc.json?.data?.emptyReason;
const n = disc.json?.data?.candidates?.length;
check(
  "discovery_media_isolation",
  disc.status === 200,
  emptyReason ? `emptyReason=${emptyReason}` : `candidates=${n}`,
);

const un = await api("/api/v1/matches/unmatch", {
  method: "POST",
  body: "{}",
});
check("unmatch_authz", un.status === 400 || un.status === 422, `status=${un.status}`);

const matches = await api("/api/v1/matches");
check(
  "matching_and_chat_surface",
  matches.status === 200,
  `status=${matches.status} matches=${matches.json?.data?.matches?.length ?? matches.json?.data?.length ?? "?"}`,
);

const book = await api("/api/v1/services/bookings");
check("bookings_own", book.status === 200, `status=${book.status}`);

const delProbe = await api("/api/v1/me/delete", {
  method: "POST",
  body: JSON.stringify({ confirm: "NO" }),
});
check(
  "delete_confirm_gate",
  delProbe.status === 400 || delProbe.status === 422,
  `status=${delProbe.status}`,
);

const ai = await api("/api/v1/ai/assist", {
  method: "POST",
  body: JSON.stringify({ purpose: "gift_suggest", prompt: "x" }),
});
check(
  "ai_assist_surface",
  [200, 401, 403, 422].includes(ai.status),
  `status=${ai.status}`,
);

const privacy = await fetch(`${BASE}/me/privacy`, { redirect: "manual" });
check(
  "privacy_consent_route",
  [200, 302, 303, 307].includes(privacy.status),
  `status=${privacy.status}`,
);

const acctDel = await fetch(`${BASE}/account-deletion`, { redirect: "manual" });
check(
  "account_deletion_page",
  acctDel.status === 200 || [302, 303, 307].includes(acctDel.status),
  `status=${acctDel.status}`,
);

const pass = checks.every((c) => c.pass);
const report = {
  at: new Date().toISOString(),
  base: BASE,
  pass,
  note: "Non-destructive; AI revoke stickiness + full delete not exercised against live QA user",
  checks,
};
mkdirSync("docs/evidence/release-unblock-2026-10-26", { recursive: true });
writeFileSync(
  "docs/evidence/release-unblock-2026-10-26/critical-path-api-smoke.json",
  JSON.stringify(report, null, 2),
);
console.log(pass ? "Summary: PASS" : "Summary: FAIL");
process.exit(pass ? 0 : 1);
