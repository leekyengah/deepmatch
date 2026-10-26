/**
 * Seed two stable QA users + mutual match + active couple + pin + booking.
 * Writes credentials to .ai/qa.env.ps1 (gitignored).
 *
 *   node --env-file=.env.local scripts/seed-qa-pair.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !service || !anon) {
  console.error("Missing Supabase env (URL / SERVICE_ROLE / ANON|PUBLISHABLE)");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password =
  process.env.QA_PASSWORD ?? `DmQa!${randomBytes(8).toString("hex")}`;
const emailA = process.env.QA_EMAIL_A ?? "qa_a@deepmatch.test";
const emailB = process.env.QA_EMAIL_B ?? "qa_b@deepmatch.test";

async function ensureUser(email, displayName, birthDate, region) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listed.data?.users?.find((u) => u.email === email);
  let userId;
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, birth_date: birthDate },
    });
    if (error) throw error;
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

  const { error: pErr } = await admin.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    birth_date: birthDate,
    fuzzy_region: region,
    discovery_opt_in: true,
    hidden_from_discovery: false,
    suspended: false,
  });
  if (pErr) throw pErr;

  await admin.from("profile_deep").upsert({
    user_id: userId,
    goals: ["long_term"],
    values: ["kindness", "honesty"],
    interests: ["coffee", "travel"],
  });

  await admin.from("match_preferences").upsert({
    user_id: userId,
    min_age: 22,
    max_age: 45,
    regions: [region],
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

const idA = await ensureUser(emailA, "QA Alpha", "1993-04-12", "HN");
const idB = await ensureUser(emailB, "QA Beta", "1994-08-20", "HN");
const [userA, userB] = idA < idB ? [idA, idB] : [idB, idA];

// Clear prior likes between pair then recreate mutual
await admin.from("likes").delete().eq("actor_id", idA).eq("target_id", idB);
await admin.from("likes").delete().eq("actor_id", idB).eq("target_id", idA);
await admin.from("likes").insert([
  { actor_id: idA, target_id: idB, action: "like" },
  { actor_id: idB, target_id: idA, action: "like" },
]);

let { data: match } = await admin
  .from("mutual_matches")
  .select("id")
  .eq("user_a", userA)
  .eq("user_b", userB)
  .maybeSingle();

if (!match) {
  const { data, error } = await admin
    .from("mutual_matches")
    .insert({ user_a: userA, user_b: userB })
    .select("id")
    .single();
  if (error) throw error;
  match = data;
}

let { data: conv } = await admin
  .from("conversations")
  .select("id")
  .eq("mutual_match_id", match.id)
  .maybeSingle();
if (!conv) {
  const { data, error } = await admin
    .from("conversations")
    .insert({ mutual_match_id: match.id })
    .select("id")
    .single();
  if (error) throw error;
  conv = data;
}

// Ensure one message
const { count: msgCount } = await admin
  .from("messages")
  .select("id", { count: "exact", head: true })
  .eq("conversation_id", conv.id);
if (!msgCount) {
  await admin.from("messages").insert({
    conversation_id: conv.id,
    sender_id: idA,
    body: "Xin chào từ QA seed — nghiệm thu chat.",
    client_dedupe_key: `qa-seed-${randomBytes(4).toString("hex")}`,
  });
}

// Active couple space
let { data: pair } = await admin
  .from("pairs")
  .select("id, status")
  .or(
    `and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`,
  )
  .eq("status", "active")
  .maybeSingle();

if (!pair) {
  const { data, error } = await admin
    .from("pairs")
    .insert({ user_a: userA, user_b: userB, status: "active" })
    .select("id, status")
    .single();
  if (error) throw error;
  pair = data;
}

// Idempotent three-layer pins (accept suite requires visited+wishlist+milestone)
const { data: existingPins } = await admin
  .from("pins")
  .select("id, layer")
  .eq("pair_id", pair.id);

const layersPresent = new Set((existingPins ?? []).map((p) => p.layer));
const pinSpecs = [
  {
    layer: "visited",
    title: "Hồ Gươm QA",
    place_label: "Hoàn Kiếm, Hà Nội",
    created_by: idA,
  },
  {
    layer: "wishlist",
    title: "Đà Lạt muốn đến",
    place_label: "Đà Lạt",
    created_by: idB,
  },
  {
    layer: "milestone",
    title: "Ngày bắt đầu QA",
    place_label: "Hà Nội",
    visited_on: "2026-10-01",
    created_by: idA,
  },
];

const missingPins = pinSpecs.filter((s) => !layersPresent.has(s.layer));
if (missingPins.length) {
  const { error: pinErr } = await admin.from("pins").insert(
    missingPins.map((s) => ({
      pair_id: pair.id,
      ...s,
    })),
  );
  if (pinErr) throw pinErr;
}

const { data: visitedPin } = await admin
  .from("pins")
  .select("id")
  .eq("pair_id", pair.id)
  .eq("layer", "visited")
  .limit(1)
  .maybeSingle();

let pinId = visitedPin?.id ?? existingPins?.[0]?.id;

if (pinId) {
  const { data: priorNote } = await admin
    .from("private_notes")
    .select("id")
    .eq("pin_id", pinId)
    .eq("author_id", idA)
    .eq("shared_with_partner", false)
    .limit(1)
    .maybeSingle();
  if (!priorNote) {
    await admin.from("private_notes").insert({
      pin_id: pinId,
      author_id: idA,
      body: "Ghi chú riêng của Alpha — Beta không đọc mặc định.",
      shared_with_partner: false,
    });
  }
}

const { data: offering } = await admin
  .from("service_offerings")
  .select("id")
  .eq("active", true)
  .limit(1)
  .maybeSingle();

if (offering) {
  const { data: prior } = await admin
    .from("service_bookings")
    .select("id")
    .eq("requester_id", idA)
    .eq("offering_id", offering.id)
    .eq("status", "requested")
    .maybeSingle();
  if (!prior) {
    await admin.from("service_bookings").insert({
      offering_id: offering.id,
      requester_id: idA,
      pair_id: pair.id,
      status: "requested",
    });
  }
}

await admin.from("consent_events").insert([
  {
    user_id: idA,
    consent_key: "terms_v1",
    version: "2026-10-12",
    granted: true,
  },
  {
    user_id: idB,
    consent_key: "terms_v1",
    version: "2026-10-12",
    granted: true,
  },
]);

const jwtA = await jwtFor(emailA);
const jwtB = await jwtFor(emailB);

mkdirSync(".ai", { recursive: true });
const ps1 = [
  `$env:E2E_BASE_URL="https://datingvn.com"`,
  `$env:QA_EMAIL_A="${emailA}"`,
  `$env:QA_EMAIL_B="${emailB}"`,
  `$env:QA_PASSWORD="${password}"`,
  `$env:E2E_EMAIL="${emailA}"`,
  `$env:E2E_PASSWORD="${password}"`,
  `$env:QA_USER_A_ID="${idA}"`,
  `$env:QA_USER_B_ID="${idB}"`,
  `$env:QA_PAIR_ID="${pair.id}"`,
  `$env:QA_CONVERSATION_ID="${conv.id}"`,
  `$env:QA_MATCH_ID="${match.id}"`,
  `$env:QA_PIN_ID="${pinId}"`,
  `$env:QA_JWT_A="${jwtA}"`,
  `$env:QA_JWT_B="${jwtB}"`,
].join("\n");
writeFileSync(".ai/qa.env.ps1", ps1 + "\n", "utf8");
writeFileSync(
  ".ai/qa-seed.json",
  JSON.stringify(
    {
      emailA,
      emailB,
      idA,
      idB,
      pairId: pair.id,
      conversationId: conv.id,
      matchId: match.id,
      pinId,
      seededAt: new Date().toISOString(),
    },
    null,
    2,
  ),
  "utf8",
);

console.log("QA seed OK");
console.log(`A=${emailA}`);
console.log(`B=${emailB}`);
console.log(`pair=${pair.id}`);
console.log(`conversation=${conv.id}`);
console.log("Credentials: .ai/qa.env.ps1 (gitignored)");
