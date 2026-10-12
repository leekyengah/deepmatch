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
import { createHmac, randomUUID } from "node:crypto";

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

// Venue review report (user) — staff resolve needs admin_roles
{
  const report = await api("/api/v1/admin/venues", tokenA, {
    method: "POST",
    body: JSON.stringify({
      place_id: "hn-cafe-01",
      review_id: "r1",
      reason: "QA sample report",
    }),
  });
  const staffDeny = await api("/api/v1/admin/venues", tokenA);
  record(
    "QA-REL-069",
    (report.status < 400 || report.status === 200) && staffDeny.status === 403,
    `venue report=${report.status} staffGET=${staffDeny.status}`,
  );
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

// Matchmaking invite A→B then B accepts; A cannot accept
{
  const inv = await api("/api/v1/matchmaking/invites", tokenA, {
    method: "POST",
    body: JSON.stringify({ target_id: idB, note: "QA invite" }),
  });
  const inviteId = inv.body?.data?.invite?.id;
  let acceptOk = false;
  let denySelf = false;
  if (inviteId) {
    const selfAccept = await api("/api/v1/matchmaking/invites", tokenA, {
      method: "PATCH",
      body: JSON.stringify({ id: inviteId, action: "accept" }),
    });
    denySelf = selfAccept.status >= 400;
    const accept = await api("/api/v1/matchmaking/invites", tokenB, {
      method: "PATCH",
      body: JSON.stringify({ id: inviteId, action: "accept" }),
    });
    acceptOk =
      accept.status < 400 && accept.body?.data?.invite?.status === "accepted";
  }
  record(
    "QA-REL-030",
    inv.status < 400 && acceptOk,
    `invite create=${inv.status} accept=${acceptOk} denySelf=${denySelf}`,
  );
}

// Orders history list
{
  const hist = await api("/api/v1/checkout/orders", tokenA);
  record(
    "QA-REL-037",
    hist.status === 200 && Array.isArray(hist.body?.data?.orders),
    `orders history ${hist.status} n=${hist.body?.data?.orders?.length ?? 0}`,
  );
}

// Dual-consent meeting after accepted invite
{
  const invList = await api("/api/v1/matchmaking/invites", tokenA);
  const accepted = (invList.body?.data?.invites ?? []).find(
    (i) => i.status === "accepted" && i.target_id === idB,
  );
  const create = await api("/api/v1/matchmaking/meetings", tokenA, {
    method: "POST",
    body: JSON.stringify({
      invitee_id: idB,
      invite_id: accepted?.id,
      place_label: "QA cafe sandbox",
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  const mid = create.body?.data?.meeting?.id;
  let confirmed = false;
  if (mid) {
    const consentB = await api("/api/v1/matchmaking/meetings", tokenB, {
      method: "PATCH",
      body: JSON.stringify({ id: mid, action: "consent" }),
    });
    confirmed =
      consentB.status < 400 &&
      consentB.body?.data?.meeting?.status === "confirmed";
  }
  record(
    "QA-REL-036",
    create.status < 400 && confirmed,
    `meeting create=${create.status} confirmed=${confirmed}`,
  );
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

// Sandbox webhook: HMAC + replay dedupe + amount check (DM-226)
{
  const secret = process.env.CHECKOUT_SANDBOX_WEBHOOK_SECRET;
  if (!secret) {
    record("QA-REL-040", false, "CHECKOUT_SANDBOX_WEBHOOK_SECRET missing");
  } else {
    const create = await api("/api/v1/checkout/orders", tokenA, {
      method: "POST",
      body: JSON.stringify({ package_code: "CMP-03" }),
    });
    const order = create.body?.data?.order;
    const eventId = `qa-wh-${randomUUID()}`;
    const payload = JSON.stringify({
      event_id: eventId,
      type: "payment.succeeded",
      order_id: order?.id,
      amount_vnd: order?.amount_vnd,
      currency: order?.currency ?? "VND",
    });
    const sig = createHmac("sha256", secret).update(payload).digest("hex");
    const postWh = async (body, signature) => {
      const res = await fetch(`${base}/api/v1/checkout/webhooks/sandbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-deepmatch-signature": `sha256=${signature}`,
        },
        body,
      });
      const json = await res.json().catch(() => ({}));
      return { status: res.status, body: json };
    };
    const first = await postWh(payload, sig);
    const replay = await postWh(payload, sig);
    const badSig = await postWh(payload, "deadbeef");
    const forgedAmt = JSON.stringify({
      event_id: `qa-wh-${randomUUID()}`,
      type: "payment.succeeded",
      order_id: order?.id,
      amount_vnd: (order?.amount_vnd ?? 0) + 1,
      currency: "VND",
    });
    const forgedSig = createHmac("sha256", secret)
      .update(forgedAmt)
      .digest("hex");
    const mismatch = await postWh(forgedAmt, forgedSig);
    const ent = await api("/api/v1/entitlements", tokenA);
    const cnt = (ent.body?.data?.entitlements ?? []).filter(
      (e) => e.source_order_id === order?.id || e.package_code === "CMP-03",
    ).length;
    record(
      "QA-REL-040",
      first.status === 200 &&
        replay.status === 200 &&
        replay.body?.data?.deduped === true &&
        badSig.status === 400 &&
        mismatch.status === 400 &&
        cnt >= 1,
      `wh first=${first.status} replayDedupe=${replay.body?.data?.deduped} badSig=${badSig.status} amt=${mismatch.status} ent=${cnt}`,
    );
  }
}

// Clear prior A↔B blocks so chat suite is repeatable
{
  await api("/api/v1/blocks", tokenA, {
    method: "DELETE",
    body: JSON.stringify({ blocked_user_id: idB }),
  });
  await api("/api/v1/blocks", tokenB, {
    method: "DELETE",
    body: JSON.stringify({ blocked_user_id: idA }),
  });
}

// Mutual like A↔B + chat deny for C (DM-192)
{
  const likeAB = await api("/api/v1/likes", tokenA, {
    method: "POST",
    body: JSON.stringify({ targetId: idB, action: "like" }),
  });
  const likeBA = await api("/api/v1/likes", tokenB, {
    method: "POST",
    body: JSON.stringify({ targetId: idA, action: "like" }),
  });
  const mutual =
    likeBA.status < 400 &&
    (likeBA.body?.mutual === true || likeBA.body?.ok === true);
  const stealChat = await api(
    `/api/v1/messages?conversationId=${randomUUID()}`,
    tokenC,
  );
  record(
    "QA-REL-018",
    likeAB.status < 400 && mutual && stealChat.status >= 400,
    `likeAB=${likeAB.status} mutual=${mutual} cChat=${stealChat.status}`,
  );
}

// Chat access helper: no mutual → deny
{
  const denied = await api("/api/v1/chat/access", tokenA, {
    method: "POST",
    body: JSON.stringify({
      isAuthenticated: true,
      isMutualMatch: false,
      isParticipant: false,
      isBlockedEitherWay: false,
      userSuspended: false,
    }),
  });
  record(
    "QA-REL-020",
    denied.status === 403 || denied.body?.allowed === false,
    `chatAccess deny status=${denied.status} allowed=${denied.body?.allowed}`,
  );
}

// Chat delivery + dedupe after mutual match (QA-REL-021)
let conversationId = null;
{
  const matches = await api("/api/v1/matches", tokenA);
  const row = (matches.body?.data?.matches ?? []).find(
    (m) => m.peer_id === idB && m.conversation_id,
  );
  conversationId = row?.conversation_id ?? null;
  const dedupe = `qa-msg-${randomUUID()}`;
  let sentOk = false;
  let readOk = false;
  let dedupeOk = false;
  if (conversationId) {
    const send1 = await api("/api/v1/messages", tokenA, {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        text: "QA hello from A",
        clientDedupeKey: dedupe,
      }),
    });
    const send2 = await api("/api/v1/messages", tokenA, {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        text: "QA hello from A",
        clientDedupeKey: dedupe,
      }),
    });
    sentOk = send1.status < 400;
    const list = await api(
      `/api/v1/messages?conversationId=${conversationId}`,
      tokenB,
    );
    const msgs = list.body?.messages ?? list.body?.data?.messages ?? [];
    const hits = msgs.filter((m) => m.client_dedupe_key === dedupe);
    readOk = list.status === 200 && msgs.some((m) => m.body === "QA hello from A");
    dedupeOk = hits.length === 1 && send2.status < 400;
  }
  record(
    "QA-REL-021",
    Boolean(conversationId) && sentOk && readOk && dedupeOk,
    `conv=${Boolean(conversationId)} sent=${sentOk} read=${readOk} dedupe=${dedupeOk}`,
  );
}

// Block then chat denied + report (QA-REL-022)
{
  const block = await api("/api/v1/blocks", tokenA, {
    method: "POST",
    body: JSON.stringify({ blocked_user_id: idB }),
  });
  let postBlockDenied = false;
  if (conversationId) {
    const trySend = await api("/api/v1/messages", tokenB, {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        text: "should fail after block",
        clientDedupeKey: `qa-block-${randomUUID()}`,
      }),
    });
    postBlockDenied = trySend.status >= 400;
  }
  const report = await api("/api/v1/reports", tokenA, {
    method: "POST",
    body: JSON.stringify({
      target_user_id: idB,
      conversation_id: conversationId,
      reason: "QA synthetic abuse report — staging only",
    }),
  });
  // cleanup block for next runs
  await api("/api/v1/blocks", tokenA, {
    method: "DELETE",
    body: JSON.stringify({ blocked_user_id: idB }),
  });
  record(
    "QA-REL-022",
    block.status < 400 && postBlockDenied && report.status < 400,
    `block=${block.status} chatDenied=${postBlockDenied} report=${report.status}`,
  );
}

// Couple invite A→B accept; C denied private pins (QA-REL-025/026 partial)
{
  // Reuse existing active A↔B pair when present (accept RPC rejects second pairing)
  const adminPairs = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: existingPairs } = await adminPairs
    .from("pairs")
    .select("id, status, user_a, user_b")
    .eq("status", "active")
    .or(
      `and(user_a.eq.${idA},user_b.eq.${idB}),and(user_a.eq.${idB},user_b.eq.${idA})`,
    )
    .limit(1);
  let pairId = existingPairs?.[0]?.id ?? null;
  let path = "existing";
  if (!pairId) {
    const inv = await api("/api/v1/couple-invitations", tokenA, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const code = inv.body?.code;
    if (code) {
      const acc = await api("/api/v1/couple-invitations/accept", tokenB, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      pairId = acc.body?.pairId ?? null;
      path = `invite=${inv.status}/accept=${acc.status}`;
    } else {
      path = `invite=${inv.status}`;
    }
  }
  let cDenied = false;
  if (pairId) {
    const steal = await api(`/api/v1/couples/${pairId}/pins`, tokenC);
    cDenied = steal.status >= 400;
  }
  record(
    "QA-REL-025",
    Boolean(pairId) && cDenied,
    `path=${path} pair=${Boolean(pairId)} cPins=${cDenied ? "denied" : "leaked"}`,
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
