/**
 * Staging-only: deactivate DEMO/sandbox commerce catalog for customer queries.
 * Does not delete rows; does not touch production Supabase.
 *
 *   node --env-file=.env.local scripts/sanitize-staging-demo-catalog.mjs
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

const { data: providers, error: pErr } = await admin
  .from("commerce_providers")
  .select("id, slug, status, display_name")
  .eq("status", "DEMO");
if (pErr) {
  console.error(pErr.message);
  process.exit(1);
}

const providerIds = (providers ?? []).map((p) => p.id);
console.log(`DEMO/sandbox providers: ${providerIds.length}`);

let deactivated = 0;
if (providerIds.length) {
  const { data: products, error } = await admin
    .from("commerce_products")
    .update({ active: false })
    .in("provider_id", providerIds)
    .eq("active", true)
    .select("id");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  deactivated += products?.length ?? 0;
}

const { data: sandboxProducts, error: sErr } = await admin
  .from("commerce_products")
  .update({ active: false })
  .eq("fulfillment", "SANDBOX_ONLY")
  .eq("active", true)
  .select("id");
if (sErr) {
  console.error(sErr.message);
  process.exit(1);
}
deactivated += sandboxProducts?.length ?? 0;

const { count: activeLeft } = await admin
  .from("commerce_products")
  .select("id", { count: "exact", head: true })
  .eq("active", true);

console.log(
  JSON.stringify(
    {
      ok: true,
      staging: STAGING_HOST,
      providersHidden: providerIds.length,
      productsDeactivated: deactivated,
      activeProductsRemaining: activeLeft ?? 0,
      note: "Rows retained for QA; customer UI filters DEMO + active=false",
    },
    null,
    2,
  ),
);
