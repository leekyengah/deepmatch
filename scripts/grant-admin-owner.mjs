/**
 * Grant platform owner (admin_roles.role = owner) by email.
 * Requires service role. Idempotent upsert.
 *
 *   node --env-file=.env.local scripts/grant-admin-owner.mjs
 *   node --env-file=.env.local scripts/grant-admin-owner.mjs --email=leekyengah@gmail.com
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const emailArg = process.argv.find((a) => a.startsWith("--email="));
const email = (emailArg?.slice("--email=".length) ||
  process.env.ADMIN_OWNER_EMAIL ||
  "leekyengah@gmail.com").trim().toLowerCase();

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listed.error) {
  console.error(listed.error.message);
  process.exit(1);
}

const user = listed.data.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(
    `No auth user for ${email}. Sign up / invite that email first, then re-run.`,
  );
  process.exit(2);
}

const { data: existingProfile } = await admin
  .from("profiles")
  .select("id")
  .eq("id", user.id)
  .maybeSingle();

if (!existingProfile) {
  const { error: profileErr } = await admin.from("profiles").insert({
    id: user.id,
    display_name: user.user_metadata?.display_name ?? "DeepMatch Owner",
    birth_date: "1994-01-01",
  });
  if (profileErr) {
    console.error("profiles insert:", profileErr.message);
    process.exit(1);
  }
}

const { error: roleErr } = await admin.from("admin_roles").upsert({
  user_id: user.id,
  role: "owner",
});
if (roleErr) {
  console.error("admin_roles upsert:", roleErr.message);
  process.exit(1);
}

const { error: auditErr } = await admin.from("audit_logs").insert({
  actor_id: user.id,
  action: "admin.role.grant",
  entity_type: "admin_roles",
  entity_id: user.id,
  reason: "scripts/grant-admin-owner.mjs",
  metadata: { email, role: "owner" },
});
if (auditErr) {
  console.warn("audit_logs insert skipped:", auditErr.message);
}

console.log(`OK: ${email} → admin_roles.owner (user_id=${user.id})`);
