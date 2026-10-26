/**
 * Synthetic QA only — authenticated pin_id insert/roundtrip on staging.
 * Usage: node --env-file=.env.local scripts/probe-pin-id-staging.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

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
const pairId = process.env.QA_PAIR_ID;
const pinEnv = process.env.QA_PIN_ID || null;

if (!url || !anon || !email || !password || !pairId) {
  console.error("Missing QA/env — need seed-qa-pair + .env.local");
  process.exit(1);
}

const client = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: sess, error: se } = await client.auth.signInWithPassword({
  email,
  password,
});
if (se) {
  console.error("login_fail", se.message);
  process.exit(1);
}

const uid = sess.user.id;
const out = {
  at: new Date().toISOString(),
  pairConfigured: true,
  pinEnvConfigured: Boolean(pinEnv),
};

const { error: e0 } = await client
  .from("media_objects")
  .select("id,pin_id,pair_id")
  .limit(1);
out.media_select = { ok: !e0, err: e0?.message || null };

const { data: pins, error: pe } = await client
  .from("pins")
  .select("id,title,layer")
  .eq("pair_id", pairId)
  .limit(5);
out.pins = { ok: !pe, count: pins?.length ?? 0, err: pe?.message || null };

const usePin = pinEnv || pins?.[0]?.id || null;
out.usedExistingPin = Boolean(usePin);

if (!usePin) {
  // create a temporary pin for probe
  const { data: created, error: ce } = await client
    .from("pins")
    .insert({
      pair_id: pairId,
      created_by: uid,
      layer: "milestone",
      title: `qa-pin-probe-${Date.now()}`,
      lat: 21.0285,
      lng: 105.8542,
    })
    .select("id")
    .single();
  out.createdPin = { ok: !ce && !!created?.id, err: ce?.message || null };
  if (created?.id) out.probePinId = created.id;
} else {
  out.probePinId = usePin;
}

if (out.probePinId) {
  const path = `${uid}/pin-probe-${Date.now()}.jpg`;
  const { data: row, error: ie } = await client
    .from("media_objects")
    .insert({
      owner_user_id: uid,
      pair_id: pairId,
      pin_id: out.probePinId,
      storage_path: path,
      content_type: "image/jpeg",
      bytes: 12,
    })
    .select("id,pin_id")
    .single();
  out.insert_with_pin = {
    ok: !ie && row?.pin_id === out.probePinId,
    err: ie?.message || null,
  };
  if (row?.id) {
    const { data: got } = await client
      .from("media_objects")
      .select("id,pin_id")
      .eq("id", row.id)
      .maybeSingle();
    out.roundtrip = { ok: got?.pin_id === out.probePinId };
    await client.from("media_objects").delete().eq("id", row.id);
  }
}

const r = await fetch("https://datingvn.com/api/v1/couples/active", {
  headers: { Authorization: `Bearer ${sess.session.access_token}` },
});
const j = await r.json().catch(() => ({}));
out.bff_couples_active = {
  status: r.status,
  keys: Object.keys(j || {}).slice(0, 15),
};

mkdirSync("docs/evidence/remediation-w1-2026-10-26", { recursive: true });
// redact any accidental ids in printed summary
const printable = {
  ...out,
  probePinId: out.probePinId ? "<uuid>" : null,
};
writeFileSync(
  "docs/evidence/remediation-w1-2026-10-26/PIN_ID_AUTH_PROBE.json",
  JSON.stringify(printable, null, 2),
);
console.log(JSON.stringify(printable, null, 2));
const fail =
  !out.media_select?.ok ||
  !out.insert_with_pin?.ok ||
  (out.roundtrip && !out.roundtrip.ok);
process.exit(fail ? 2 : 0);
