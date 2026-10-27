import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError } from "@/lib/api-error";

/** EXT-016 — DEMO booking lifecycle only (no real provider / payment). */

export async function GET() {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  const { data, error } = await supabase
    .from("commerce_demo_bookings")
    .select(
      "id, status, quote_vnd, notes, created_at, updated_at, product_id, commerce_products(mock_id, title, category, demo_banner)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return jsonError("INTERNAL");

  return NextResponse.json({
    ok: true,
    demo: true,
    banner: await apiT("demoBanner"),
    bookings: data ?? [],
  });
}

export async function POST(req: NextRequest) {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  let body: {
    product_id?: string;
    idempotency_key?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson");
  }

  if (!body.product_id) {
    return jsonError("VALIDATION_ERROR", "productIdRequired");
  }

  const { data: product, error: pErr } = await supabase
    .from("commerce_products")
    .select("id, price_vnd, title, fulfillment")
    .eq("id", body.product_id)
    .eq("active", true)
    .maybeSingle();
  if (pErr || !product) {
    return jsonError("VALIDATION_ERROR", "productNotFound");
  }
  if (product.fulfillment !== "SANDBOX_ONLY") {
    return jsonError("FORBIDDEN", "sandboxOnly");
  }

  const key =
    body.idempotency_key?.slice(0, 80) ||
    `demo-${product.id}-${user.id.slice(0, 8)}`;

  const { data: existing } = await supabase
    .from("commerce_demo_bookings")
    .select("id, status, quote_vnd, created_at")
    .eq("user_id", user.id)
    .eq("idempotency_key", key)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      ok: true,
      demo: true,
      replay: true,
      booking: existing,
      receipt: await apiT("demoReceiptReserved", { title: product.title }),
    });
  }

  const { data: booking, error } = await supabase
    .from("commerce_demo_bookings")
    .insert({
      user_id: user.id,
      product_id: product.id,
      status: "DEMO_RESERVED",
      idempotency_key: key,
      quote_vnd: product.price_vnd,
      notes: body.notes?.slice(0, 500) ?? "Sandbox demo reserve",
    })
    .select("id, status, quote_vnd, created_at, idempotency_key")
    .single();
  if (error) return jsonError("INTERNAL");

  return NextResponse.json({
    ok: true,
    demo: true,
    booking,
    receipt: await apiT("demoReceiptPriced", { title: product.title, price: `${product.price_vnd}₫` }),
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  let body: { id?: string; action?: "confirm" | "cancel" };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson");
  }
  if (!body.id || !body.action) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid");
  }

  const next =
    body.action === "confirm"
      ? "DEMO_CONFIRMED"
      : body.action === "cancel"
        ? "CANCELLED"
        : null;
  if (!next) return jsonError("VALIDATION_ERROR", "bookingActionInvalid");

  const { data, error } = await supabase
    .from("commerce_demo_bookings")
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id, status, quote_vnd")
    .maybeSingle();
  if (error) return jsonError("INTERNAL");
  if (!data) return jsonError("VALIDATION_ERROR", "bookingNotFound");

  return NextResponse.json({
    ok: true,
    demo: true,
    booking: data,
    note:
      next === "DEMO_CONFIRMED"
        ? await apiT("demoConfirmed")
        : await apiT("demoCancelled"),
  });
}
