import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { makeRequestId } from "@/lib/api-error";

export const runtime = "nodejs";

/**
 * Stripe webhook — verifies signature, upserts subscription/payment via service role.
 * Enable only with STRIPE_WEBHOOK_SECRET on production.
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !service || !url) {
    return NextResponse.json(
      { error: "webhook_not_configured", request_id: requestId },
      { status: 503 },
    );
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  if (!verifyStripeSignature(raw, sig, secret)) {
    return NextResponse.json(
      { error: "invalid_signature", request_id: requestId },
      { status: 400 },
    );
  }

  const event = JSON.parse(raw) as {
    type: string;
    data: { object: Record<string, unknown> };
  };

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.paid"
  ) {
    const obj = event.data.object;
    const userId =
      (obj.client_reference_id as string | undefined) ||
      ((obj.metadata as { user_id?: string } | undefined)?.user_id);
    const customerId = obj.customer as string | undefined;
    const subId =
      (obj.subscription as string | undefined) ||
      (obj.id as string | undefined);

    if (userId) {
      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_code:
            ((obj.metadata as { plan?: string } | undefined)?.plan) ||
            "premium",
          status: "active",
          provider: "stripe",
          provider_customer_id: customerId ?? null,
          provider_subscription_id: subId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_subscription_id" },
      );

      const amount =
        typeof obj.amount_total === "number"
          ? obj.amount_total
          : typeof obj.amount_paid === "number"
            ? obj.amount_paid
            : 0;
      const paymentRef =
        (obj.payment_intent as string | undefined) ||
        (obj.id as string | undefined);
      if (paymentRef) {
        await admin.from("payments").upsert(
          {
            user_id: userId,
            amount_cents: amount,
            currency: String(obj.currency ?? "vnd").toLowerCase(),
            status: "paid",
            provider: "stripe",
            provider_payment_ref: paymentRef,
            metadata: { event: event.type },
          },
          { onConflict: "provider,provider_payment_ref" },
        );
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const obj = event.data.object;
    const subId = obj.id as string | undefined;
    if (subId) {
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("provider", "stripe")
        .eq("provider_subscription_id", subId);
    }
  }

  return NextResponse.json({ received: true, request_id: requestId });
}

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): boolean {
  try {
    const parts = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, v] = p.split("=");
        return [k, v];
      }),
    );
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) return false;
    const expected = createHmac("sha256", secret)
      .update(`${t}.${payload}`)
      .digest("hex");
    const a = Buffer.from(v1);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
