/**
 * CEO-gated purge of synthetic Mebertes cohort only.
 *
 * Safety:
 *  - Requires MEBERTES_ALLOW_PURGE=1
 *  - Requires --ceo-approve
 *  - Requires --confirm=Mebertes
 *  - Staging host only
 *  - Optional --require-real-users=10000 (profiles where cohort is null)
 *  - Dry-run by default unless --execute
 *
 *   MEBERTES_ALLOW_PURGE=1 node --env-file=.env.local scripts/purge-mebertes.mjs --ceo-approve --confirm=Mebertes
 *   MEBERTES_ALLOW_PURGE=1 node --env-file=.env.local scripts/purge-mebertes.mjs --ceo-approve --confirm=Mebertes --require-real-users=10000 --execute
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const COHORT = "Mebertes";
const STAGING_HOST = "zzqpvjdyvjarpphqhaze.supabase.co";
const root = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const ceo = args.includes("--ceo-approve");
const execute = args.includes("--execute");
const confirm = args.find((a) => a.startsWith("--confirm="))?.split("=")[1];
const requireReal = Number(
  args.find((a) => a.startsWith("--require-real-users="))?.split("=")[1] ?? 0,
);
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split("=")[1])) : null;

if (process.env.MEBERTES_ALLOW_PURGE !== "1") {
  console.error("Refusing: set MEBERTES_ALLOW_PURGE=1");
  process.exit(1);
}
if (!ceo || confirm !== COHORT) {
  console.error("Refusing: need --ceo-approve and --confirm=Mebertes");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!url.includes(STAGING_HOST)) {
  console.error(`Refusing: staging host only. Got ${new URL(url).host}`);
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { count: realCount, error: realErr } = await admin
  .from("profiles")
  .select("id", { count: "exact", head: true })
  .is("cohort", null);
if (realErr) {
  console.error("real-user count failed:", realErr.message);
  process.exit(1);
}
if (requireReal > 0 && (realCount ?? 0) < requireReal) {
  console.error(
    JSON.stringify({
      refused: true,
      reason: "real_users_below_threshold",
      realCount,
      requireReal,
    }),
  );
  process.exit(1);
}

let query = admin
  .from("seed_cohort_registry")
  .select("user_id, email, taxonomy_key, region")
  .eq("cohort", COHORT)
  .order("email", { ascending: true });
if (LIMIT) query = query.limit(LIMIT);

const { data: rows, error: listErr } = await query;
if (listErr) {
  console.error(listErr.message);
  process.exit(1);
}

const list = rows ?? [];
console.log(
  JSON.stringify(
    {
      mode: execute ? "EXECUTE" : "DRY_RUN",
      cohort: COHORT,
      realCount,
      requireReal: requireReal || null,
      toPurge: list.length,
      sample: list.slice(0, 5).map((r) => r.email),
    },
    null,
    2,
  ),
);

if (!execute) {
  console.log("Dry-run only. Pass --execute to delete.");
  process.exit(0);
}

let ok = 0;
let fail = 0;
const failures = [];
for (const row of list) {
  const { error } = await admin.auth.admin.deleteUser(row.user_id);
  if (error) {
    fail += 1;
    failures.push({ email: row.email, error: error.message });
  } else {
    ok += 1;
  }
  if ((ok + fail) % 50 === 0) {
    console.log(JSON.stringify({ progress: ok + fail, ok, fail }));
  }
}

const evidenceDir = join(root, "..", "docs", "evidence", "mebertes-2026-10-27");
mkdirSync(evidenceDir, { recursive: true });
writeFileSync(
  join(evidenceDir, `purge-${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      cohort: COHORT,
      ceoApproved: true,
      realCount,
      ok,
      fail,
      failures: failures.slice(0, 50),
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ ok, fail, cohort: COHORT }, null, 2));
if (fail > 0) process.exit(2);
