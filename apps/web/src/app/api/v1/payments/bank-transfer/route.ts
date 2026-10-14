import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { bankTransferInfo, PREMIUM_PRICE_VND } from "@/lib/billing";

export async function GET() {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_cents, status, provider, metadata, created_at")
    .eq("user_id", user.id)
    .eq("provider", "bank_hd")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_code, status, current_period_end, provider")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    data: {
      bank: bankTransferInfo(),
      payments: payments ?? [],
      subscription: sub,
    },
    meta: { request_id: requestId },
  });
}

export async function POST() {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_billing"))) {
    return jsonError("FORBIDDEN", "flagBillingOff", requestId);
  }
  if (!(await flagEnabled("ff_premium"))) {
    return jsonError("FORBIDDEN", "flagPremiumOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase.rpc("create_bank_transfer_payment", {
    p_amount_vnd: PREMIUM_PRICE_VND,
    p_plan_code: "premium",
  });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  const payload = data as {
    payment_id: string;
    transfer_code: string;
    amount_vnd: number;
    status: string;
  };

  return NextResponse.json({
    data: {
      ...payload,
      bank: bankTransferInfo(),
      transfer_content: `${payload.transfer_code} PREMIUM`,
    },
    meta: { request_id: requestId },
  });
}
