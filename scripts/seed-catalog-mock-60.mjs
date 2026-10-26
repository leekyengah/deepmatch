/**
 * EXT-004 — Seed 60 DEMO catalog rows from scripts/data/catalog-mock-60.json
 *
 *   node --env-file=.env.local scripts/seed-catalog-mock-60.mjs
 *   node --env-file=.env.local scripts/seed-catalog-mock-60.mjs --reset
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const root = dirname(fileURLToPath(import.meta.url));
const rows = JSON.parse(
  readFileSync(join(root, "data", "catalog-mock-60.json"), "utf8"),
);

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

if (reset) {
  await admin.from("commerce_demo_bookings").delete().neq("status", "");
  await admin.from("commerce_offers").delete().neq("currency", "");
  await admin.from("commerce_products").delete().neq("mock_id", "");
  await admin.from("commerce_providers").delete().neq("slug", "");
  console.log("Reset commerce catalog tables");
}

let upserted = 0;
for (const row of rows) {
  const slug = `prov-${row.mock_id.toLowerCase().replace(/_/g, "-")}`;
  const { data: provider, error: pErr } = await admin
    .from("commerce_providers")
    .upsert(
      {
        slug,
        display_name: row.provider,
        category: row.category,
        status: "DEMO",
        source_note: "Fictional seed — not a real business",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (pErr) {
    console.error("provider", row.mock_id, pErr.message);
    process.exit(1);
  }

  const { data: product, error: prErr } = await admin
    .from("commerce_products")
    .upsert(
      {
        mock_id: row.mock_id,
        category: row.category,
        provider_id: provider.id,
        title: row.title,
        kind: row.kind,
        description: `${row.title} — bản mẫu DEMO/SANDBOX. Không phải giao dịch thật.`,
        price_vnd: row.price_vnd,
        unit: row.unit,
        fulfillment: "SANDBOX_ONLY",
        demo_banner: "BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT",
        active: true,
      },
      { onConflict: "mock_id" },
    )
    .select("id")
    .single();
  if (prErr) {
    console.error("product", row.mock_id, prErr.message);
    process.exit(1);
  }

  const { data: existingOffers } = await admin
    .from("commerce_offers")
    .select("id")
    .eq("product_id", product.id)
    .limit(1);
  if (!existingOffers?.length) {
    const { error } = await admin.from("commerce_offers").insert({
      product_id: product.id,
      label: "DEMO offer",
      price_vnd: row.price_vnd,
      currency: "VND",
      is_demo: true,
    });
    if (error) {
      console.error("offer", row.mock_id, error.message);
      process.exit(1);
    }
  }

  upserted += 1;
}

const { count } = await admin
  .from("commerce_products")
  .select("id", { count: "exact", head: true });

console.log(`OK: seeded ${upserted} rows; commerce_products count=${count}`);
if (count !== 60) {
  console.warn(`Expected 60 products, got ${count}`);
  process.exit(2);
}
