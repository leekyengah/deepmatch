import { NextResponse } from "next/server";
import {
  assertAppleTransaction,
  decodeJwsPayload,
  type AppleTransactionPayload,
} from "@/lib/apple-iap";
import { createServiceClient } from "@/lib/supabase/route";
import { makeRequestId } from "@/lib/api-error";

export const runtime = "nodejs";

type AsnPayload = {
  notificationType?: string;
  subtype?: string;
  data?: {
    signedTransactionInfo?: string;
    bundleId?: string;
  };
};

/**
 * App Store Server Notifications V2 — configure URL in App Store Connect.
 * Updates subscription status on renew / expire / refund.
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  const body = (await req.json().catch(() => ({}))) as {
    signedPayload?: string;
  };
  if (!body.signedPayload) {
    return NextResponse.json(
      { error: "missing_signedPayload", request_id: requestId },
      { status: 400 },
    );
  }

  const outer = decodeJwsPayload<AsnPayload>(body.signedPayload);
  if (!outer?.data?.signedTransactionInfo) {
    return NextResponse.json(
      { error: "invalid_payload", request_id: requestId },
      { status: 400 },
    );
  }

  const tx = decodeJwsPayload<AppleTransactionPayload>(
    outer.data.signedTransactionInfo,
  );
  if (!tx) {
    return NextResponse.json(
      { error: "invalid_transaction", request_id: requestId },
      { status: 400 },
    );
  }

  const check = assertAppleTransaction(tx);
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason, request_id: requestId },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "not_configured", request_id: requestId },
      { status: 503 },
    );
  }

  const originalId = tx.originalTransactionId ?? tx.transactionId!;
  const nType = (outer.notificationType ?? "").toUpperCase();
  let status = "active";
  if (
    nType.includes("EXPIRED") ||
    nType.includes("REVOKE") ||
    nType.includes("REFUND") ||
    nType.includes("GRACE_PERIOD_EXPIRED")
  ) {
    status = "cancelled";
  } else if (nType.includes("DID_FAIL_TO_RENEW")) {
    status = "past_due";
  }

  const expiresAt = tx.expiresDate
    ? new Date(tx.expiresDate).toISOString()
    : null;

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, user_id")
    .eq("provider", "apple")
    .eq("provider_subscription_id", originalId)
    .maybeSingle();

  if (existing) {
    await admin
      .from("subscriptions")
      .update({
        status,
        current_period_end: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  }

  return NextResponse.json({
    ok: true,
    notificationType: outer.notificationType,
    status,
    request_id: requestId,
  });
}
