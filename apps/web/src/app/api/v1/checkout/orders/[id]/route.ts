import { NextResponse, type NextRequest } from "next/server";
import {
  assertSandboxOnly,
  isIdempotentNoop,
  transitionOrder,
} from "@deepmatch/shared";
import { getRouteUser, createServiceClient } from "@/lib/supabase/route";
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment";
import { jsonError, makeRequestId } from "@/lib/api-error";

const ACTIONS = new Set([
  "select_method",
  "mark_processing",
  "sandbox_succeed",
  "sandbox_fail",
  "cancel",
  "request_refund",
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

  let body: { action?: string; method?: string; idempotency_key?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.action || !ACTIONS.has(body.action)) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  try {
    assertSandboxOnly(process.env.SERVICES_PAYMENT_LIVE === "true");
  } catch {
    return jsonError("FORBIDDEN", "livePspForbidden", requestId);
  }

  const { data: order } = await supabase
    .from("checkout_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);

  if (isIdempotentNoop(order.status as string, body.action, "order")) {
    return NextResponse.json({
      data: { order, idempotent: true },
      meta: { request_id: requestId },
    });
  }

  const transition = transitionOrder(
    order.status as string,
    body.action,
    "user",
  );
  if (!transition.ok) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  const snapshot = {
    ...(typeof order.price_snapshot === "object" && order.price_snapshot
      ? (order.price_snapshot as Record<string, unknown>)
      : {}),
    method: body.method ?? "sandbox_bank",
    sandbox: true,
    live_psp: false,
  };

  if (body.action === "sandbox_succeed") {
    const admin = createServiceClient();
    await admin
      .from("checkout_orders")
      .update({
        price_snapshot: snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", order.status);
    await fulfillPaidOrder(admin, {
      id: order.id,
      user_id: order.user_id,
      sku: order.sku,
      package_code: order.package_code,
      amount_vnd: order.amount_vnd,
      currency: order.currency,
      status: order.status,
    });
    await admin.from("commerce_audit_log").insert({
      entity_type: "order",
      entity_id: id,
      from_status: order.status,
      to_status: "paid",
      action: body.action,
      actor_role: "user",
      actor_user_id: user.id,
      request_id: requestId,
      meta: {
        sandbox: true,
        live_psp: false,
        idempotency_key: body.idempotency_key ?? null,
      },
    });
    const { data: updated } = await supabase
      .from("checkout_orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    return NextResponse.json({
      data: { order: updated },
      meta: { request_id: requestId },
    });
  }

  const { data: updated, error } = await supabase
    .from("checkout_orders")
    .update({
      status: transition.to,
      price_snapshot: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", order.status)
    .select("*")
    .maybeSingle();
  if (error || !updated) return jsonError("INTERNAL", null, requestId);

  const admin = createServiceClient();
  await admin.from("commerce_audit_log").insert({
    entity_type: "order",
    entity_id: id,
    from_status: order.status,
    to_status: transition.to,
    action: body.action,
    actor_role: "user",
    actor_user_id: user.id,
    request_id: requestId,
    meta: {
      sandbox: true,
      live_psp: false,
      audit_event: transition.auditEvent,
      idempotency_key: body.idempotency_key ?? null,
    },
  });

  return NextResponse.json({
    data: { order: updated },
    meta: { request_id: requestId },
  });
}
