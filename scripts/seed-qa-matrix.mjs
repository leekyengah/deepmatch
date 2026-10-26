/**
 * QA account matrix (staging/local only). Credentials → .ai/qa-matrix.env.ps1 (gitignored).
 *
 *   node --env-file=.env.local scripts/seed-qa-matrix.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing Supabase URL / SERVICE_ROLE");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password =
  process.env.QA_PASSWORD ?? `DmQa!${randomBytes(8).toString("hex")}`;

const ACCOUNTS = [
  {
    id: "QA-USER-01",
    email: "qa_user01@deepmatch.test",
    name: "QA User 01",
    birth: "1993-01-15",
    region: "HN",
    discovery: true,
  },
  {
    id: "QA-USER-02",
    email: "qa_user02@deepmatch.test",
    name: "QA User 02",
    birth: "1994-03-22",
    region: "HN",
    discovery: true,
  },
  {
    id: "QA-USER-03",
    email: "qa_user03@deepmatch.test",
    name: "QA User 03",
    birth: "1992-07-08",
    region: "HCM",
    discovery: true,
  },
  {
    id: "QA-COUPLE-A",
    email: "qa_couple_a@deepmatch.test",
    name: "QA Couple A",
    birth: "1991-05-10",
    region: "HN",
    discovery: false,
  },
  {
    id: "QA-COUPLE-B",
    email: "qa_couple_b@deepmatch.test",
    name: "QA Couple B",
    birth: "1992-09-18",
    region: "HN",
    discovery: false,
  },
  {
    id: "QA-EX-PARTNER",
    email: "qa_ex@deepmatch.test",
    name: "QA Ex Partner",
    birth: "1990-11-02",
    region: "DN",
    discovery: true,
  },
  {
    id: "QA-PREMIUM",
    email: "qa_premium@deepmatch.test",
    name: "QA Premium",
    birth: "1989-04-25",
    region: "HN",
    discovery: true,
  },
  {
    id: "QA-SUSPENDED",
    email: "qa_suspended@deepmatch.test",
    name: "QA Suspended",
    birth: "1995-12-01",
    region: "HN",
    discovery: false,
    suspended: true,
  },
];

async function ensureUser(acc) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listed.data?.users?.find((u) => u.email === acc.email);
  let userId;
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { display_name: acc.name, birth_date: acc.birth, qa_id: acc.id },
    });
    if (error) throw error;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: acc.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: acc.name, birth_date: acc.birth, qa_id: acc.id },
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const { error: pErr } = await admin.from("profiles").upsert({
    id: userId,
    display_name: acc.name,
    birth_date: acc.birth,
    fuzzy_region: acc.region,
    discovery_opt_in: Boolean(acc.discovery),
    hidden_from_discovery: false,
    suspended: Boolean(acc.suspended),
  });
  if (pErr) throw pErr;

  await admin.from("profile_deep").upsert({
    user_id: userId,
    goals: ["long_term"],
    values: ["kindness"],
    interests: ["coffee", "travel"],
  });

  return userId;
}

const ids = {};
for (const acc of ACCOUNTS) {
  ids[acc.id] = await ensureUser(acc);
  console.log(`OK ${acc.id} ${acc.email} ${ids[acc.id]}`);
}

// Mutual match USER-01 ↔ USER-02
const a = ids["QA-USER-01"];
const b = ids["QA-USER-02"];
const [ua, ub] = a < b ? [a, b] : [b, a];
await admin.from("likes").delete().eq("actor_id", a).eq("target_id", b);
await admin.from("likes").delete().eq("actor_id", b).eq("target_id", a);
await admin.from("likes").insert([
  { actor_id: a, target_id: b, action: "like" },
  { actor_id: b, target_id: a, action: "like" },
]);
const { data: mm } = await admin
  .from("mutual_matches")
  .select("id")
  .eq("user_a", ua)
  .eq("user_b", ub)
  .maybeSingle();
if (!mm) {
  await admin.from("mutual_matches").insert({ user_a: ua, user_b: ub });
}

// Block USER-03 → USER-01
await admin.from("blocks").upsert({
  blocker_id: ids["QA-USER-03"],
  blocked_id: ids["QA-USER-01"],
});

// Active couple A↔B
const ca = ids["QA-COUPLE-A"];
const cb = ids["QA-COUPLE-B"];
const [pa, pb] = ca < cb ? [ca, cb] : [cb, ca];
const { data: existingPair } = await admin
  .from("pairs")
  .select("id")
  .eq("user_a", pa)
  .eq("user_b", pb)
  .maybeSingle();
if (!existingPair) {
  await admin.from("pairs").insert({
    user_a: pa,
    user_b: pb,
    status: "active",
  });
} else {
  await admin.from("pairs").update({ status: "active" }).eq("id", existingPair.id);
}

mkdirSync(".ai", { recursive: true });
const lines = [
  `# QA matrix — DO NOT COMMIT SECRETS TO TRACKER`,
  `$env:QA_PASSWORD='${password}'`,
  ...ACCOUNTS.map(
    (acc) =>
      `$env:${acc.id.replace(/-/g, "_")}_EMAIL='${acc.email}'; $env:${acc.id.replace(/-/g, "_")}_ID='${ids[acc.id]}'`,
  ),
];
writeFileSync(".ai/qa-matrix.env.ps1", lines.join("\n"), "utf8");
writeFileSync(
  ".ai/qa-seed.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      passwordHint: "see qa-matrix.env.ps1 (gitignored)",
      accounts: ACCOUNTS.map((a) => ({
        id: a.id,
        email: a.email,
        userId: ids[a.id],
        suspended: Boolean(a.suspended),
      })),
    },
    null,
    2,
  ),
  "utf8",
);

console.log("Wrote .ai/qa-matrix.env.ps1 and .ai/qa-seed.json");
console.log("NOTE: QA-ADMIN / QA-MODERATOR / QA-ADVISOR require RBAC grant — skipped if no permission.");
