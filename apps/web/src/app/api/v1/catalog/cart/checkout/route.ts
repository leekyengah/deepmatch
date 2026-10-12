import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError } from "@/lib/api-error";

/** EXT-017 — sandbox cart checkout → DEMO bookings only (no real PSP). */

type LineIn = { product_id?: string; qty?: number };

export async function POST(req: NextRequest) {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  let body: { lines?: LineIn[] };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson");
  }

  const lines = (body.lines ?? []).filter((l) => l.product_id);
  if (lines.length === 0) {
    return jsonError("VALIDATION_ERROR", "cartEmpty");
  }
  if (lines.length > 20) {
    return jsonError("VALIDATION_ERROR", "cartTooManyLines");
  }

  const created: Array<{
    id: string;
    status: string;
    quote_vnd: number;
    product_id: string;
  }> = [];

  for (const line of lines) {
    const productId = line.product_id!;
    const qty = Math.min(Math.max(Number(line.qty) || 1, 1), 5);

    const { data: product, error: pErr } = await supabase
      .from("commerce_products")
      .select("id, price_vnd, title, fulfillment")
      .eq("id", productId)
      .eq("active", true)
      .maybeSingle();
    if (pErr || !product) {
      return jsonError("VALIDATION_ERROR", "productNotFound");
    }
    if (product.fulfillment !== "SANDBOX_ONLY") {
      return jsonError("FORBIDDEN", "sandboxOnly");
    }

    const key = `cart-${product.id}-${user.id.slice(0, 8)}-${Date.now()}`;
    const { data: booking, error } = await supabase
      .from("commerce_demo_bookings")
      .insert({
        user_id: user.id,
        product_id: product.id,
        status: "DEMO_RESERVED",
        idempotency_key: key,
        quote_vnd: product.price_vnd * qty,
        notes: `Sandbox cart checkout qty=${qty}`,
      })
      .select("id, status, quote_vnd, product_id")
      .single();
    if (error) return jsonError("INTERNAL");
    created.push(booking);
  }

  return NextResponse.json({
    ok: true,
    demo: true,
    payment: "SANDBOX_MOCK_PSP",
    invoice: false,
    banner:
      await apiT("demoCheckoutOk"),
    bookings: created,
  });
}
