import type { SupabaseClient } from "@supabase/supabase-js";

type OrderRow = {
  id: string;
  user_id: string;
  sku: string;
  package_code: string | null;
  amount_vnd: number;
  currency: string;
  status: string;
};

/** Exactly-once entitlement grant for a paid sandbox/live order. */
export async function fulfillPaidOrder(
  admin: SupabaseClient,
  order: OrderRow,
): Promise<{ entitlementCreated: boolean }> {
  const { data: existing } = await admin
    .from("entitlements")
    .select("id")
    .eq("source_order_id", order.id)
    .maybeSingle();

  await admin
    .from("checkout_orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (existing) return { entitlementCreated: false };

  const { error } = await admin.from("entitlements").insert({
    user_id: order.user_id,
    sku: order.sku,
    package_code: order.package_code,
    status: "active",
    quota_total: 1,
    quota_used: 0,
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    source_order_id: order.id,
    sandbox: true,
  });

  if (error) {
    // unique race — treat as already fulfilled
    if (error.code === "23505") return { entitlementCreated: false };
    throw error;
  }
  return { entitlementCreated: true };
}
