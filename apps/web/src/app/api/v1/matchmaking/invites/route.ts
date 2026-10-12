import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("matchmaking_invites")
    .select("id, requester_id, target_id, booking_id, status, note, created_at")
    .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { invites: data ?? [] },
    meta: { request_id: requestId },
  });
}

export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { target_id?: string; booking_id?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.target_id || body.target_id === user.id) {
    return jsonError("VALIDATION_ERROR", "contactFieldsRequired", requestId);
  }

  const { data, error } = await supabase
    .from("matchmaking_invites")
    .insert({
      requester_id: user.id,
      target_id: body.target_id,
      booking_id: body.booking_id ?? null,
      status: "proposed",
      note: body.note?.slice(0, 300) ?? null,
    })
    .select("id, requester_id, target_id, status, created_at")
    .single();
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { invite: data },
    meta: { request_id: requestId },
  });
}

export async function PATCH(req: NextRequest) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { id?: string; action?: "accept" | "decline" | "withdraw" };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.id || !body.action) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  const status =
    body.action === "accept"
      ? "accepted"
      : body.action === "decline"
        ? "declined"
        : "withdrawn";

  const { data, error } = await supabase
    .from("matchmaking_invites")
    .update({ status })
    .eq("id", body.id)
    .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
    .select("id, status")
    .maybeSingle();
  if (error || !data) {
    return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
  }

  return NextResponse.json({
    data: { invite: data },
    meta: { request_id: requestId },
  });
}
