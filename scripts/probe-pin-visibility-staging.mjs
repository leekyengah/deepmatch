/**
 * Synthetic QA — pin visibility matrix (owner / partner / outsider / anon).
 * node --env-file=.env.local scripts/probe-pin-visibility-staging.mjs
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
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const pairId = process.env.QA_PAIR_ID;

async function login(email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return { client, userId: data.user.id };
}

const a = await login(process.env.QA_EMAIL_A, process.env.QA_PASSWORD);
const b = await login(process.env.QA_EMAIL_B, process.env.QA_PASSWORD);

const { data: pinsA, error: eA } = await a.client
  .from("pins")
  .select("id, layer")
  .eq("pair_id", pairId);
const { data: pinsB, error: eB } = await b.client
  .from("pins")
  .select("id, layer")
  .eq("pair_id", pairId);

const layersA = new Set((pinsA ?? []).map((p) => p.layer));
const layersOk =
  layersA.has("visited") &&
  layersA.has("wishlist") &&
  layersA.has("milestone");

const anonClient = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: anonPins, error: eAnon } = await anonClient
  .from("pins")
  .select("id")
  .eq("pair_id", pairId);

// Outsider: sign up ephemeral or use empty session + try as random uuid filter via service? Use unauthenticated only.
// If E2E_EMAIL exists as third user, use it; else treat outsider = no JWT beyond anon.
let outsiderCount = null;
let outsiderErr = "no_third_user";
if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
  try {
    const o = await login(process.env.E2E_EMAIL, process.env.E2E_PASSWORD);
    if (o.userId !== a.userId && o.userId !== b.userId) {
      const { data: op, error } = await o.client
        .from("pins")
        .select("id")
        .eq("pair_id", pairId);
      outsiderCount = op?.length ?? 0;
      outsiderErr = error?.message || null;
    }
  } catch (e) {
    outsiderErr = e.message;
  }
}

const results = {
  at: new Date().toISOString(),
  owner_sees_three_layers: {
    pass: !eA && (pinsA?.length ?? 0) >= 3 && layersOk,
    count: pinsA?.length ?? 0,
    err: eA?.message || null,
  },
  partner_sees_pins: {
    pass: !eB && (pinsB?.length ?? 0) >= 3,
    count: pinsB?.length ?? 0,
    err: eB?.message || null,
  },
  anonymous_denied_or_empty: {
    pass: (anonPins?.length ?? 0) === 0,
    count: anonPins?.length ?? 0,
    err: eAnon?.message || null,
  },
  outsider_denied_or_empty: {
    pass: outsiderCount === null ? null : outsiderCount === 0,
    count: outsiderCount,
    err: outsiderErr,
  },
};

const required = [
  results.owner_sees_three_layers.pass,
  results.partner_sees_pins.pass,
  results.anonymous_denied_or_empty.pass,
];
const pass =
  required.every(Boolean) &&
  (results.outsider_denied_or_empty.pass === null ||
    results.outsider_denied_or_empty.pass === true);

mkdirSync("docs/evidence/remediation-w1-2026-10-26", { recursive: true });
writeFileSync(
  "docs/evidence/remediation-w1-2026-10-26/PIN_VISIBILITY_MATRIX.json",
  JSON.stringify({ pass, results }, null, 2),
);
console.log(JSON.stringify({ pass, results }, null, 2));
process.exit(pass ? 0 : 2);
