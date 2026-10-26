import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/route";
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment";
import { makeRequestId } from "@/lib/api-error";

export const runtime = "nodejs";

/**
 * Sandbox PSP webhook — HMAC verified, event_id deduped, amount/currency checked.
 * LIVE Stripe remains on /api/v1/payments/webhooks/stripe (keys required).
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  const secret = process.env.CHECKOUT_SANDBOX_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook_not_configured", request_id: requestId },
      { status: 503 },
    );
  }

  const raw = await req.text();
  const sig = req.headers.get("x-deepmatch-signature") ?? "";
  if (!verifyHmac(raw, sig, secret)) {
    return NextResponse.json(
      { error: "invalid_signature", request_id: requestId },
      { status: 400 },
    );
  }

  let body: {
    event_id?: string;
    type?: string;
    order_id?: string;
    amount_vnd?: number;
    currency?: string;
  };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", request_id: requestId },
      { status: 400 },
    );
  }

  if (!body.event_id || !body.type || !body.order_id) {
    return NextResponse.json(
      { error: "validation_error", request_id: requestId },
      { status: 400 },
    );
  }

  const admin = createServiceClient();

  const { data: dup } = await admin
    .from("payment_webhook_events")
    .select("id, status")
    .eq("provider", "sandbox")
    .eq("event_id", body.event_id)
    .maybeSingle();
  if (dup) {
    return NextResponse.json({
      data: { deduped: true, event_id: body.event_id },
      meta: { request_id: requestId },
    });
  }

  const { data: order } = await admin
    .from("checkout_orders")
    .select("id, user_id, sku, package_code, amount_vnd, currency, status")
    .eq("id", body.order_id)
    .maybeSingle();

  if (!order) {
    await admin.from("payment_webhook_events").insert({
      provider: "sandbox",
      event_id: body.event_id,
      order_id: null,
      event_type: body.type,
      payload: body,
      status: "rejected",
    });
    return NextResponse.json(
      { error: "order_not_found", request_id: requestId },
      { status: 404 },
    );
  }

  if (
    typeof body.amount_vnd === "number" &&
    body.amount_vnd !== order.amount_vnd
  ) {
    await admin.from("payment_webhook_events").insert({
      provider: "sandbox",
      event_id: body.event_id,
      order_id: order.id,
      event_type: body.type,
      payload: body,
      status: "rejected",
    });
    return NextResponse.json(
      { error: "amount_mismatch", request_id: requestId },
      { status: 400 },
    );
  }
  if (
    typeof body.currency === "string" &&
    body.currency !== order.currency
  ) {
    await admin.from("payment_webhook_events").insert({
      provider: "sandbox",
      event_id: body.event_id,
      order_id: order.id,
      event_type: body.type,
      payload: body,
      status: "rejected",
    });
    return NextResponse.json(
      { error: "currency_mismatch", request_id: requestId },
      { status: 400 },
    );
  }

  let entitlementCreated = false;
  if (body.type === "payment.succeeded") {
    const result = await fulfillPaidOrder(admin, order);
    entitlementCreated = result.entitlementCreated;
  } else if (body.type === "payment.failed") {
    if (order.status !== "paid") {
      await admin
        .from("checkout_orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }
  }

  await admin.from("payment_webhook_events").insert({
    provider: "sandbox",
    event_id: body.event_id,
    order_id: order.id,
    event_type: body.type,
    payload: body,
    status: "processed",
  });

  return NextResponse.json({
    data: {
      ok: true,
      order_id: order.id,
      entitlement_created: entitlementCreated,
    },
    meta: { request_id: requestId },
  });
}

function verifyHmac(raw: string, header: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const provided = header.replace(/^sha256=/i, "").trim();
  if (!provided || provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}
