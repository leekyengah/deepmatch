import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";

/**
 * Creates a Stripe Checkout Session when STRIPE_SECRET_KEY + price are set.
 * No charge is attempted without keys — returns clear setup error.
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_billing"))) {
    return jsonError("FORBIDDEN", "flagBillingOff", requestId);
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID_PREMIUM;
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  if (!secret || !priceId) {
    return jsonError("VALIDATION_ERROR", "stripeNotConfigured", 
      requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan = body.plan?.trim() || "premium";

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "subscription",
      success_url: `${appUrl}/me/account?billing=success`,
      cancel_url: `${appUrl}/me/account?billing=cancel`,
      client_reference_id: user.id,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[user_id]": user.id,
      "metadata[plan]": plan,
    }),
  });

  const session = (await stripeRes.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };
  if (!stripeRes.ok || !session.url) {
    return jsonError("VALIDATION_ERROR", "stripeCheckoutFailed", requestId);
  }

  return NextResponse.json({
    data: { checkout_url: session.url, session_id: session.id },
    meta: { request_id: requestId },
  });
}
