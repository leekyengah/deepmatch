/**
 * Seed two staging users + private note for live RLS deny tests.
 * Usage (from repo root, with .env.local loaded):
 *   node --env-file=.env.local scripts/seed-rls-users.mjs
 * Prints env exports for npm run test:integration (does not print passwords after create).
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !service || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON / SERVICE_ROLE");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const suffix = randomBytes(3).toString("hex");
const password = `DmTest!${randomBytes(6).toString("hex")}`;
const emailA = `rls_a_${suffix}@deepmatch.test`;
const emailB = `rls_b_${suffix}@deepmatch.test`;

async function ensureUser(email, displayName) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error) throw error;
  const id = data.user.id;
  // Upsert profile (trigger may race)
  await admin.from("profiles").upsert({
    id,
    display_name: displayName,
    birth_date: "1995-01-15",
    fuzzy_region: "HN",
    discovery_opt_in: false,
    hidden_from_discovery: true,
  });
  await admin.from("profile_deep").upsert({
    user_id: id,
    goals: ["long_term"],
    values: ["kindness"],
    interests: ["coffee"],
  });
  return id;
}

async function jwtFor(email) {
  const userClient = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await userClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session.access_token;
}

const idA = await ensureUser(emailA, "RLS Alpha");
const idB = await ensureUser(emailB, "RLS Beta");

const { data: pair, error: pairErr } = await admin
  .from("pairs")
  .insert({
    user_a: idA < idB ? idA : idB,
    user_b: idA < idB ? idB : idA,
    status: "active",
  })
  .select("id")
  .single();
if (pairErr) throw pairErr;

const { data: pin, error: pinErr } = await admin
  .from("pins")
  .insert({
    pair_id: pair.id,
    layer: "visited",
    title: "RLS private pin",
    created_by: idA,
  })
  .select("id")
  .single();
if (pinErr) throw pinErr;

const { data: note, error: noteErr } = await admin
  .from("private_notes")
  .insert({
    pin_id: pin.id,
    author_id: idA,
    body: "secret note — B must not read",
    shared_with_partner: false,
  })
  .select("id")
  .single();
if (noteErr) throw noteErr;

const jwtA = await jwtFor(emailA);
const jwtB = await jwtFor(emailB);

console.log("# RLS seed OK — copy into shell (password not reused after this run)");
console.log(`$env:SUPABASE_URL="${url}"`);
console.log(`$env:SUPABASE_ANON_KEY="${anon}"`);
console.log(`$env:RLS_TEST_USER_A_JWT="${jwtA}"`);
console.log(`$env:RLS_TEST_USER_B_JWT="${jwtB}"`);
console.log(`$env:RLS_TEST_PRIVATE_NOTE_ID_A="${note.id}"`);
console.log(`# emails: ${emailA} / ${emailB}`);
