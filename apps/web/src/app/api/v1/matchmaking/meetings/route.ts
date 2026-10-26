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
    .from("matchmaking_meetings")
    .select(
      "id, invite_id, proposer_id, invitee_id, place_label, scheduled_at, status, proposer_consent, invitee_consent, created_at",
    )
    .or(`proposer_id.eq.${user.id},invitee_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { meetings: data ?? [] },
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

  let body: {
    invitee_id?: string;
    invite_id?: string;
    place_label?: string;
    scheduled_at?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.invitee_id || body.invitee_id === user.id) {
    return jsonError("VALIDATION_ERROR", "contactFieldsRequired", requestId);
  }

  if (body.invite_id) {
    const { data: inv } = await supabase
      .from("matchmaking_invites")
      .select("id, status, requester_id, target_id")
      .eq("id", body.invite_id)
      .maybeSingle();
    if (!inv || inv.status !== "accepted") {
      return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
    }
    const party =
      (inv.requester_id === user.id && inv.target_id === body.invitee_id) ||
      (inv.target_id === user.id && inv.requester_id === body.invitee_id);
    if (!party) {
      return jsonError("FORBIDDEN", null, requestId);
    }
  }

  const { data, error } = await supabase
    .from("matchmaking_meetings")
    .insert({
      proposer_id: user.id,
      invitee_id: body.invitee_id,
      invite_id: body.invite_id ?? null,
      place_label: body.place_label?.slice(0, 200) ?? null,
      scheduled_at: body.scheduled_at ?? null,
      status: "proposed",
      proposer_consent: true,
      invitee_consent: false,
    })
    .select(
      "id, invite_id, proposer_id, invitee_id, place_label, scheduled_at, status, proposer_consent, invitee_consent, created_at",
    )
    .single();
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { meeting: data },
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

  let body: {
    id?: string;
    action?: "consent" | "withdraw_consent" | "complete" | "cancel";
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.id || !body.action) {
    return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
  }

  const { data: existing, error: loadErr } = await supabase
    .from("matchmaking_meetings")
    .select(
      "id, proposer_id, invitee_id, status, proposer_consent, invitee_consent",
    )
    .eq("id", body.id)
    .or(`proposer_id.eq.${user.id},invitee_id.eq.${user.id}`)
    .maybeSingle();
  if (loadErr || !existing) {
    return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
  }

  const isProposer = existing.proposer_id === user.id;
  const isInvitee = existing.invitee_id === user.id;
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.action === "consent") {
    if (isProposer) patch.proposer_consent = true;
    if (isInvitee) patch.invitee_consent = true;
    const both =
      (isProposer ? true : existing.proposer_consent) &&
      (isInvitee ? true : existing.invitee_consent);
    if (both && existing.status === "proposed") patch.status = "confirmed";
  } else if (body.action === "withdraw_consent") {
    if (isProposer) patch.proposer_consent = false;
    if (isInvitee) patch.invitee_consent = false;
    if (existing.status === "confirmed" || existing.status === "proposed") {
      patch.status = "withdrawn";
    }
  } else if (body.action === "complete") {
    if (existing.status !== "confirmed") {
      return jsonError("VALIDATION_ERROR", "bookingActionInvalid", requestId);
    }
    if (!existing.proposer_consent || !existing.invitee_consent) {
      return jsonError("FORBIDDEN", null, requestId);
    }
    patch.status = "completed";
  } else if (body.action === "cancel") {
    patch.status = "cancelled";
  }

  const { data, error } = await supabase
    .from("matchmaking_meetings")
    .update(patch)
    .eq("id", body.id)
    .select(
      "id, status, proposer_consent, invitee_consent, place_label, scheduled_at",
    )
    .maybeSingle();
  if (error || !data) {
    return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
  }

  return NextResponse.json({
    data: { meeting: data },
    meta: { request_id: requestId },
  });
}
