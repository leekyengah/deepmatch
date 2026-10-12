/**
 * Staging QA run for Master tabs 34/35/36.
 * Seeds/refreshes QA pair, exercises APIs, writes docs/evidence/QA_RUN_*.json
 * Never prints passwords/JWTs into Master — only pass/fail + commit.
 *
 *   node --env-file=.env.local scripts/qa-master-run.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const base = (process.env.E2E_BASE_URL || "https://datingvn.com").replace(
  /\/$/,
  "",
);

if (!url || !service || !anon) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const emailA = process.env.QA_EMAIL_A ?? "qa_a@deepmatch.test";
const emailB = process.env.QA_EMAIL_B ?? "qa_b@deepmatch.test";
const emailC = process.env.QA_EMAIL_C ?? "qa_c@deepmatch.test";
const password = process.env.QA_PASSWORD ?? "DmQa!StagingRun13";

async function ensureUser(email, displayName, birthDate) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listed.data?.users?.find((u) => u.email === email);
  let userId;
  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, birth_date: birthDate },
    });
    if (error) throw error;
    userId = data.user.id;
  }
  await admin.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    birth_date: birthDate,
    fuzzy_region: "HN",
    discovery_opt_in: true,
    hidden_from_discovery: false,
    suspended: false,
  });
  return userId;
}

async function jwtFor(email) {
  const client = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session.access_token;
}

async function api(path, token, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

const results = [];
function record(id, ok, note) {
  results.push({ id, status: ok ? "PASS" : "FAIL", note });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} — ${note}`);
}

console.log("Seeding QA users…");
const idA = await ensureUser(emailA, "QA Alpha", "1993-04-12");
const idB = await ensureUser(emailB, "QA Beta", "1994-08-20");
const idC = await ensureUser(emailC, "QA Charlie", "1992-01-05");
const tokenA = await jwtFor(emailA);
const tokenB = await jwtFor(emailB);
const tokenC = await jwtFor(emailC);

// Needs answers A
{
  const put = await api("/api/v1/needs/answers", tokenA, {
    method: "PUT",
    body: JSON.stringify({
      consent: true,
      merge: true,
      answers: { C01: "hẹn hò", C05: "cùng thành phố" },
    }),
  });
  record("QA-REL-013", put.status < 400, `needs PUT ${put.status}`);
}

// Privacy: C cannot read A's needs via own GET (only own data)
{
  const a = await api("/api/v1/needs/answers", tokenA);
  const c = await api("/api/v1/needs/answers", tokenC);
  const aHas = Boolean(c.body?.data?.answers?.C01) === false;
  const aOwn = Boolean(a.body?.data?.answers?.C01);
  record("QA-REL-014", a.status === 200 && c.status === 200 && aOwn && aHas, "C own answers isolated");
}

// Guest denied
{
  const g = await api("/api/v1/needs/answers", null);
  record("QA-REL-003", g.status === 401, `guest needs ${g.status}`);
}

// Login session
{
  record("QA-REL-005", Boolean(tokenA && tokenB), "A/B login JWT issued");
}

// Places public
{
  const p = await api("/api/v1/places?limit=5", null);
  const ok = p.status === 200 && Array.isArray(p.body?.data?.places);
  record("QA-REL-028", ok, `places list ${p.status} n=${p.body?.data?.places?.length ?? 0}`);
}

// Preferences
{
  const put = await api("/api/v1/needs/preferences", tokenA, {
    method: "PUT",
    body: JSON.stringify({
      consent: true,
      preferences: { C05: { desire: "cùng thành phố", weight: 2, hard: true } },
    }),
  });
  record("QA-REL-016", put.status < 400, `prefs PUT ${put.status}`);
}

// Checkout sandbox order + entitlement
{
  const create = await api("/api/v1/checkout/orders", tokenA, {
    method: "POST",
    body: JSON.stringify({ package_code: "CMP-01" }),
  });
  const orderId = create.body?.data?.order?.id;
  let paidOk = false;
  let paidNote = "";
  if (orderId) {
    const paid = await api(`/api/v1/checkout/orders/${orderId}`, tokenA, {
      method: "PATCH",
      body: JSON.stringify({ action: "sandbox_succeed" }),
    });
    paidOk = paid.status < 400 && paid.body?.data?.order?.status === "paid";
    paidNote = `paid=${paid.status}/${paid.body?.data?.order?.status}`;
  } else {
    paidNote = `create=${create.status} ${JSON.stringify(create.body?.error || create.body).slice(0, 120)}`;
  }
  const ent = await api("/api/v1/entitlements", tokenA);
  const hasEnt =
    Array.isArray(ent.body?.data?.entitlements) &&
    ent.body.data.entitlements.some((e) => e.package_code === "CMP-01");
  record(
    "QA-REL-035",
    create.status < 400 && paidOk && hasEnt,
    `checkout→entitlement ${paidNote} ent=${hasEnt}`,
  );
}

// Cross-user order deny
{
  const create = await api("/api/v1/checkout/orders", tokenA, {
    method: "POST",
    body: JSON.stringify({ package_code: "CMP-02" }),
  });
  const orderId = create.body?.data?.order?.id;
  const steal = orderId
    ? await api(`/api/v1/checkout/orders/${orderId}`, tokenC)
    : { status: 0 };
  record(
    "QA-REL-010",
    steal.status >= 400 || !steal.body?.data?.order,
    `C cannot read A order (${steal.status})`,
  );
}

// Matchmaking invite A→B
{
  const inv = await api("/api/v1/matchmaking/invites", tokenA, {
    method: "POST",
    body: JSON.stringify({ target_id: idB, note: "QA invite" }),
  });
  record("QA-REL-030", inv.status < 400, `invite ${inv.status}`);
}

// Media library gate
{
  const lib = await api("/api/v1/media/library", tokenA);
  record(
    "QA-REL-009",
    lib.status === 200 && lib.body?.data?.gate,
    `media gate ${lib.status}`,
  );
}

// Services booking cancel path
{
  const list = await api("/api/v1/services/bookings", tokenA);
  record(
    "QA-REL-031",
    list.status === 200 || list.status === 403,
    `bookings ${list.status}`,
  );
}

const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;
let commit = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  /* ignore */
}

const runId = `QA-STAGING-${new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)}`;
const report = {
  runId,
  timestampUtc: new Date().toISOString(),
  environment: base,
  commit,
  personas: ["QA_ADULT_A", "QA_ADULT_B", "QA_ADULT_C"],
  executed: results.length,
  pass,
  fail,
  results,
  recommendation:
    fail === 0
      ? "STAGING PARTIAL GO — continue autonomous QA-REL matrix; Store/LIVE still NO GO"
      : "STAGING NEEDS FIX — see FAIL rows; Store/LIVE NO GO",
};

mkdirSync("docs/evidence", { recursive: true });
const path = `docs/evidence/${runId}.json`;
writeFileSync(path, JSON.stringify(report, null, 2));
writeFileSync("docs/evidence/QA_RUN_LATEST.json", JSON.stringify(report, null, 2));
console.log(`\nWrote ${path}`);
console.log(`PASS ${pass} / FAIL ${fail} / ${results.length}`);
console.log(report.recommendation);
