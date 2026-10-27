import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const base = (process.env.E2E_BASE_URL || "https://datingvn.com").replace(/\/$/, "");

async function ensure(email, password, meta, profile) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let u = listed.data.users.find((x) => x.email === email);
  if (!u) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error) throw error;
    u = data.user;
  } else {
    await admin.auth.admin.updateUserById(u.id, {
      password,
      email_confirm: true,
      user_metadata: meta,
    });
  }
  await admin.from("profiles").upsert({ id: u.id, ...profile });
  return u;
}

async function jwt(email, password) {
  const r = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  return r.json();
}

const minorPw = "DmQa!MinorSynth14";
const staffPw = "DmQa!StaffRest14";

const minor = await ensure(
  "qa_minor_synth@deepmatch.test",
  minorPw,
  { display_name: "QA Minor Synth", birth_date: "2012-06-01" },
  {
    display_name: "QA Minor Synth",
    birth_date: "2012-06-01",
    fuzzy_region: "HN",
    discovery_opt_in: false,
    hidden_from_discovery: true,
    suspended: false,
  },
);

const staff = await ensure(
  "qa_staff_restricted@deepmatch.test",
  staffPw,
  { display_name: "QA Staff Restricted", birth_date: "1990-01-01" },
  {
    display_name: "QA Staff Restricted",
    birth_date: "1990-01-01",
    fuzzy_region: "HN",
    discovery_opt_in: false,
    hidden_from_discovery: true,
    suspended: false,
  },
);

await admin.from("admin_roles").upsert({ user_id: staff.id, role: "moderator" });

const minorTok = await jwt("qa_minor_synth@deepmatch.test", minorPw);
const staffTok = await jwt("qa_staff_restricted@deepmatch.test", staffPw);

const disc = await fetch(`${base}/api/v1/discovery/candidates?page_size=5`, {
  headers: { Authorization: `Bearer ${minorTok.access_token}` },
});
const discBody = await disc.json().catch(() => ({}));
const venues = await fetch(`${base}/api/v1/admin/venues`, {
  headers: { Authorization: `Bearer ${staffTok.access_token}` },
});
const flags = await admin
  .from("feature_flags")
  .select("name, enabled")
  .order("name");

writeFileSync(
  ".ai/qa-extra.env.ps1",
  [
    `$env:QA_MINOR_EMAIL='qa_minor_synth@deepmatch.test'`,
    `$env:QA_MINOR_PASSWORD='${minorPw}'`,
    `$env:QA_MINOR_ID='${minor.id}'`,
    `$env:QA_STAFF_EMAIL='qa_staff_restricted@deepmatch.test'`,
    `$env:QA_STAFF_PASSWORD='${staffPw}'`,
    `$env:QA_STAFF_ID='${staff.id}'`,
    "",
  ].join("\n"),
);

const out = {
  minor_id: minor.id,
  staff_id: staff.id,
  discovery_minor_status: disc.status,
  discovery_candidates: discBody?.data?.candidates?.length ?? null,
  discovery_error: discBody?.error?.code ?? null,
  admin_venues_staff: venues.status,
  flags_count: flags.data?.length ?? 0,
  flags_error: flags.error?.message ?? null,
};
console.log(JSON.stringify(out, null, 2));
writeFileSync(
  "docs/evidence/mobile-v2/qa-extra-seed-2026-10-14.json",
  JSON.stringify(out, null, 2),
);
