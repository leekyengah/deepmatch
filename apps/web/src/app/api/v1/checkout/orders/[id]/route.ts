import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

const ACTIONS = new Set([
  "select_method",
  "mark_processing",
  "sandbox_succeed",
  "sandbox_fail",
  "cancel",
]);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = makeRequestId();
  const { id } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("checkout_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) {
    return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
  }

  return NextResponse.json({
    data: { order: data },
    meta: { request_id: requestId },
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = makeRequestId();
  const { id } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { action?: string; method?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.action || !ACTIONS.has(body.action)) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  const { data: order } = await supabase
    .from("checkout_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);

  let status = order.status as string;
  if (body.action === "select_method") status = "method_selected";
  if (body.action === "mark_processing") status = "processing";
  if (body.action === "sandbox_succeed") status = "paid";
  if (body.action === "sandbox_fail") status = "failed";
  if (body.action === "cancel") status = "cancelled";

  const snapshot = {
    ...(typeof order.price_snapshot === "object" && order.price_snapshot
      ? (order.price_snapshot as Record<string, unknown>)
      : {}),
    method: body.method ?? "sandbox_bank",
    sandbox: true,
  };

  const { data: updated, error } = await supabase
    .from("checkout_orders")
    .update({
      status,
      price_snapshot: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) return jsonError("INTERNAL", null, requestId);

  if (status === "paid") {
    await supabase.from("entitlements").insert({
      user_id: user.id,
      sku: order.sku,
      package_code: order.package_code,
      status: "active",
      quota_total: 1,
      quota_used: 0,
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      source_order_id: order.id,
      sandbox: true,
    });
  }

  return NextResponse.json({
    data: { order: updated },
    meta: { request_id: requestId },
  });
}
