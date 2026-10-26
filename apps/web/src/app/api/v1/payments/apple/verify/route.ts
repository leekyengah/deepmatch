import { NextResponse } from "next/server";
import {
  assertAppleTransaction,
  decodeJwsPayload,
  type AppleTransactionPayload,
} from "@/lib/apple-iap";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { flagEnabled } from "@/lib/flags";

export const runtime = "nodejs";

/**
 * Client sends StoreKit 2 signed transaction JWS after purchase/restore.
 * Upserts subscriptions with provider='apple'.
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_billing"))) {
    return jsonError("FORBIDDEN", "flagBillingOff", requestId);
  }

  const { user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json().catch(() => ({}))) as {
    signedTransaction?: string;
    transactionJws?: string;
  };
  const jws = body.signedTransaction ?? body.transactionJws;
  if (!jws) {
    return jsonError("VALIDATION_ERROR", "missingSignedTx", 
      requestId);
  }

  const tx = decodeJwsPayload<AppleTransactionPayload>(jws);
  if (!tx) {
    return jsonError("VALIDATION_ERROR", "invalidJws", requestId);
  }

  const check = assertAppleTransaction(tx);
  if (!check.ok) {
    return jsonError("VALIDATION_ERROR", check.reason, requestId);
  }

  const originalId = tx.originalTransactionId ?? tx.transactionId!;
  const expiresAt = tx.expiresDate
    ? new Date(tx.expiresDate).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const active =
    !tx.expiresDate || tx.expiresDate > Date.now() ? "active" : "cancelled";

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return jsonError("INTERNAL", null, requestId);
  }

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan_code: "premium",
      status: active,
      provider: "apple",
      provider_subscription_id: originalId,
      provider_customer_id: tx.appAccountToken ?? null,
      current_period_end: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider,provider_subscription_id" },
  );

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  await admin.from("payments").upsert(
    {
      user_id: user.id,
      amount_cents: 0,
      currency: "vnd",
      status: "paid",
      provider: "apple",
      provider_payment_ref: tx.transactionId ?? originalId,
      metadata: {
        product_id: tx.productId,
        environment: tx.environment ?? null,
        request_id: requestId,
      },
    },
    { onConflict: "provider,provider_payment_ref" },
  );

  return NextResponse.json({
    data: {
      provider: "apple",
      status: active,
      original_transaction_id: originalId,
      current_period_end: expiresAt,
    },
    meta: { request_id: requestId },
  });
}
