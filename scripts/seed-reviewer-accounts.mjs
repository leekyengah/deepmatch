/**
 * Seed Store/Independent reviewer synthetic accounts on staging.
 * Credentials → .ai/reviewer.env.ps1 only (gitignored). Never print passwords.
 *
 *   node --env-file=.env.local scripts/seed-reviewer-accounts.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password =
  process.env.REVIEWER_PASSWORD ?? `DmRev!${randomBytes(10).toString("hex")}`;

const accounts = [
  {
    key: "A",
    email: process.env.REVIEWER_EMAIL_A ?? "reviewer_a@deepmatch.test",
    displayName: "Reviewer Alpha",
    birthDate: "1992-06-15",
    region: "HN",
  },
  {
    key: "B",
    email: process.env.REVIEWER_EMAIL_B ?? "reviewer_b@deepmatch.test",
    displayName: "Reviewer Beta",
    birthDate: "1993-11-02",
    region: "HN",
  },
  {
    key: "DELETE",
    email: process.env.REVIEWER_EMAIL_DELETE ?? "reviewer_delete@deepmatch.test",
    displayName: "Reviewer Disposable",
    birthDate: "1991-01-20",
    region: "HCM",
  },
];

async function ensureUser({ email, displayName, birthDate, region }) {
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
    values: ["kindness"],
    interests: ["coffee"],
  });

  await admin.from("match_preferences").upsert({
    user_id: userId,
    min_age: 22,
    max_age: 45,
    regions: [region],
  });

  return userId;
}

const ids = {};
for (const a of accounts) {
  ids[a.key] = await ensureUser(a);
}

// Mutual like A↔B for chat/couple surfaces (do not touch automation QA pair)
const idA = ids.A;
const idB = ids.B;
await admin.from("likes").delete().eq("actor_id", idA).eq("target_id", idB);
await admin.from("likes").delete().eq("actor_id", idB).eq("target_id", idA);
await admin.from("likes").insert([
  { actor_id: idA, target_id: idB, action: "like" },
  { actor_id: idB, target_id: idA, action: "like" },
]);

const [userA, userB] = idA < idB ? [idA, idB] : [idB, idA];
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

mkdirSync(".ai", { recursive: true });
const outPath = join(".ai", "reviewer.env.ps1");
const lines = [
  `# Reviewer synthetic accounts — STAGING ONLY — gitignored`,
  `# Created ${new Date().toISOString()} — deliver password via 1Password / sealed note`,
  `$env:REVIEWER_EMAIL_A = "${accounts[0].email}"`,
  `$env:REVIEWER_EMAIL_B = "${accounts[1].email}"`,
  `$env:REVIEWER_EMAIL_DELETE = "${accounts[2].email}"`,
  `$env:REVIEWER_PASSWORD = "${password}"`,
  `$env:REVIEWER_USER_A_ID = "${ids.A}"`,
  `$env:REVIEWER_USER_B_ID = "${ids.B}"`,
  `$env:REVIEWER_USER_DELETE_ID = "${ids.DELETE}"`,
  `$env:REVIEWER_MATCH_ID = "${match.id}"`,
];
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      outPath,
      emails: accounts.map((a) => a.email),
      matchId: match.id,
      note: "Password written only to gitignored .ai/reviewer.env.ps1 — copy to 1Password; never commit",
    },
    null,
    2,
  ),
);
