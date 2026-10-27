/**
 * Staging-only: mark profiles with Synthetic* bios as Mebertes cohort
 * so organic discover/home isolation applies. Does not delete or rewrite
 * bios to look like real users.
 *
 *   node --env-file=.env.local scripts/sanitize-staging-synthetic-bios.mjs
 */
import { createClient } from "@supabase/supabase-js";

const STAGING_HOST = "zzqpvjdyvjarpphqhaze.supabase.co";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (new URL(url).host !== STAGING_HOST) {
  console.error(`Refusing: staging host only. Got ${new URL(url).host}`);
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: rows, error } = await admin
  .from("profiles")
  .select("id, display_name, bio, cohort")
  .or("bio.ilike.%Synthetic%,display_name.ilike.%Synthetic%")
  .limit(500);
if (error) {
  console.error(error.message);
  process.exit(1);
}

const need = (rows ?? []).filter((r) => r.cohort !== "Mebertes");
let updated = 0;
for (const r of need) {
  const { error: uErr } = await admin
    .from("profiles")
    .update({ cohort: "Mebertes" })
    .eq("id", r.id);
  if (uErr) {
    console.error(r.id, uErr.message);
    process.exit(1);
  }
  updated += 1;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      matched: rows?.length ?? 0,
      cohortUpdated: updated,
      note: "Bios unchanged; cohort isolation hides from organic members",
    },
    null,
    2,
  ),
);
