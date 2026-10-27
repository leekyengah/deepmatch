/**
 * Create/reset a stable E2E user; writes credentials to gitignored .ai/e2e.env.ps1
 *   node --env-file=.env.local scripts/seed-e2e-user.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email =
  process.env.E2E_EMAIL ?? `e2e_${randomBytes(2).toString("hex")}@deepmatch.test`;
const password =
  process.env.E2E_PASSWORD ?? `DmE2e!${randomBytes(8).toString("hex")}`;

const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
const existing = listed.data?.users?.find((u) => u.email === email);

let userId;
if (existing) {
  userId = existing.id;
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "E2E User", birth_date: "1994-06-01" },
  });
  if (error) throw error;
  userId = data.user.id;
}

await admin.from("profiles").upsert({
  id: userId,
  display_name: "E2E User",
  birth_date: "1994-06-01",
  fuzzy_region: "HN",
  discovery_opt_in: true,
  hidden_from_discovery: false,
});

const ps1 = [
  `$env:E2E_BASE_URL="https://datingvn.com"`,
  `$env:E2E_EMAIL="${email}"`,
  `$env:E2E_PASSWORD="${password}"`,
  `# user_id=${userId}`,
].join("\n");

writeFileSync(".ai/e2e.env.ps1", ps1 + "\n", "utf8");
console.log("Wrote .ai/e2e.env.ps1");
console.log(`E2E_EMAIL=${email}`);
console.log("E2E_PASSWORD=(stored in .ai/e2e.env.ps1)");
