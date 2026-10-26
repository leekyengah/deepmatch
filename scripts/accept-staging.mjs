/**
 * Self-acceptance suite against staging BFF + RLS using QA JWTs.
 * Requires .ai/qa.env.ps1 variables in process env (or pass after seed).
 *
 *   node --env-file=.env.local scripts/seed-qa-pair.mjs
 *   # then load JWTs from .ai/qa-seed via this script reading .ai/qa.env.ps1 parse
 *   node --env-file=.env.local scripts/accept-staging.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.E2E_BASE_URL || "https://datingvn.com";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

const emailA = process.env.QA_EMAIL_A;
const emailB = process.env.QA_EMAIL_B;
const password = process.env.QA_PASSWORD;
const pairId = process.env.QA_PAIR_ID;
const conversationId = process.env.QA_CONVERSATION_ID;

if (!emailA || !emailB || !password || !url || !anon) {
  console.error("Missing QA credentials — run seed-qa-pair.mjs first");
  process.exit(1);
}

async function session(email) {
  const client = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return { token: data.session.access_token, userId: data.user.id, client };
}

async function api(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, ok: res.ok, json };
}

const results = [];
function check(id, pass, detail = "") {
  results.push({ id, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}${detail ? ` — ${detail}` : ""}`);
}

const a = await session(emailA);
const b = await session(emailB);

// Health
{
  const h = await api("/api/v1/health");
  check("health", h.ok && h.json?.ok && h.json?.flags?.ff_chat, JSON.stringify(h.json?.flags));
}

// Cookie-less BFF may not accept Bearer — try both Authorization and supabase path.
// Prefer testing via user supabase client (RLS) + BFF with cookie simulation if available.
// Many Next BFF routes use createClient() from cookies only. Validate RLS/data via client,
// and BFF public/health + cookie login via playwright separately.

// Discovery via RLS (BFF uses cookies — Bearer alone is not the session path)
{
  const { data, error } = await a.client
    .from("profiles")
    .select("id, display_name")
    .eq("discovery_opt_in", true)
    .eq("hidden_from_discovery", false)
    .neq("id", a.userId)
    .limit(10);
  check(
    "discovery_candidates_rls",
    !error && (data?.length ?? 0) >= 1,
    error?.message ?? `count=${data?.length}`,
  );
}

// RLS: mutual peer profile readable
{
  const { data, error } = await a.client
    .from("profiles")
    .select("id, display_name, discovery_opt_in")
    .eq("id", b.userId)
    .maybeSingle();
  check("rls_peer_profile_mutual", !error && data?.id === b.userId, error?.message);
}

// RLS: private note of A not readable by B
{
  const { data: note } = await a.client
    .from("private_notes")
    .select("id, body, shared_with_partner")
    .eq("author_id", a.userId)
    .eq("shared_with_partner", false)
    .limit(1)
    .maybeSingle();
  if (!note) {
    check("rls_private_note_deny", false, "no private note seeded");
  } else {
    const { data: leaked, error } = await b.client
      .from("private_notes")
      .select("id, body")
      .eq("id", note.id)
      .maybeSingle();
    check(
      "rls_private_note_deny",
      !leaked && !error,
      leaked ? "LEAKED" : "denied_or_empty",
    );
  }
}

// Pins visible to both pair members
{
  const { data: pinsA, error: e1 } = await a.client
    .from("pins")
    .select("id, layer, title")
    .eq("pair_id", pairId);
  const { data: pinsB, error: e2 } = await b.client
    .from("pins")
    .select("id, layer")
    .eq("pair_id", pairId);
  const layers = new Set((pinsA ?? []).map((p) => p.layer));
  check(
    "pair_pins_three_layers",
    !e1 &&
      !e2 &&
      (pinsA?.length ?? 0) >= 3 &&
      layers.has("visited") &&
      layers.has("wishlist") &&
      layers.has("milestone") &&
      (pinsB?.length ?? 0) >= 3,
    `A=${pinsA?.length} B=${pinsB?.length}`,
  );
}

// Chat messages
{
  const { data: msgs, error } = await a.client
    .from("messages")
    .select("id, body, sender_id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  check(
    "chat_messages_readable",
    !error && (msgs?.length ?? 0) >= 1,
    error?.message ?? `count=${msgs?.length}`,
  );

  const dedupe = `qa-accept-${Date.now()}`;
  const { error: sendErr } = await a.client.from("messages").insert({
    conversation_id: conversationId,
    sender_id: a.userId,
    body: "Tin nghiệm thu realtime-ready",
    client_dedupe_key: dedupe,
  });
  check("chat_send_message", !sendErr, sendErr?.message);
}

// Likes / mutual
{
  const { data: match, error } = await a.client
    .from("mutual_matches")
    .select("id")
    .eq("id", process.env.QA_MATCH_ID)
    .maybeSingle();
  check("mutual_match_exists", !error && !!match, error?.message);
}

// Media signed upload intent via storage path create
{
  const path = `${a.userId}/qa-accept-${Date.now()}.jpg`;
  const { data: media, error: mErr } = await a.client
    .from("media_objects")
    .insert({
      owner_user_id: a.userId,
      pair_id: pairId,
      storage_path: path,
      content_type: "image/jpeg",
      bytes: 1024,
    })
    .select("id")
    .single();
  const { data: signed, error: sErr } = await a.client.storage
    .from("media")
    .createSignedUploadUrl(path);
  check(
    "media_signed_upload",
    !mErr && !sErr && !!signed?.signedUrl,
    mErr?.message || sErr?.message || "ok",
  );
  if (media?.id) {
    // cleanup metadata row optional
  }
}

// Concierge offerings + booking
{
  const { data: offerings, error } = await a.client
    .from("service_offerings")
    .select("id, title")
    .eq("active", true);
  check(
    "concierge_offerings",
    !error && (offerings?.length ?? 0) >= 4,
    error?.message ?? `count=${offerings?.length}`,
  );

  const { data: bookings, error: bErr } = await a.client
    .from("service_bookings")
    .select("id, status")
    .eq("requester_id", a.userId);
  check(
    "concierge_bookings_own",
    !bErr && (bookings?.length ?? 0) >= 1,
    bErr?.message ?? `count=${bookings?.length}`,
  );

  // B must not see A's bookings
  const { data: leakBook } = await b.client
    .from("service_bookings")
    .select("id")
    .eq("requester_id", a.userId);
  check(
    "concierge_booking_rls_deny",
    (leakBook?.length ?? 0) === 0,
    `leaked=${leakBook?.length ?? 0}`,
  );
}

// Consent events readable by self
{
  const { data, error } = await a.client
    .from("consent_events")
    .select("id, consent_key, granted")
    .eq("user_id", a.userId)
    .limit(5);
  check("consent_self_select", !error && (data?.length ?? 0) >= 1, error?.message);
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass);
mkdirSync("docs/evidence", { recursive: true });
const report = {
  at: new Date().toISOString(),
  base: BASE,
  emailA,
  emailB,
  pairId,
  conversationId,
  passed,
  total: results.length,
  failed: failed.map((f) => f.id),
  results,
};
writeFileSync(
  "docs/evidence/QA-ACCEPT-2026-10-12.json",
  JSON.stringify(report, null, 2),
  "utf8",
);

console.log(`\nSummary: ${passed}/${results.length} PASS`);
if (failed.length) {
  console.error("FAILED:", failed.map((f) => f.id).join(", "));
  process.exit(2);
}
