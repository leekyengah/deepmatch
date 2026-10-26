import { NextResponse } from "next/server";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { takeToken } from "@/lib/rate-limit";

/**
 * W2 — Unmatch: remove mutual_match + conversation access + bidirectional likes.
 * Uses service role after participant check (RLS has no DELETE on mutual_matches).
 * Does not touch couple pairs (QA11: mutual ≠ pair space).
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const rl = takeToken(`unmatch:${user.id}`, 20, 60_000);
  if (!rl.ok) return jsonError("RATE_LIMITED", null, requestId);

  const body = (await req.json().catch(() => ({}))) as {
    peer_id?: string;
    match_id?: string;
  };
  const peerId = body.peer_id?.trim();
  const matchId = body.match_id?.trim();
  if (!peerId && !matchId) {
    return jsonError("VALIDATION_ERROR", "unmatchPeerRequired", requestId);
  }
  if (peerId && peerId === user.id) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return jsonError("INTERNAL", null, requestId);
  }

  let matchQuery = admin
    .from("mutual_matches")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
  if (matchId) matchQuery = matchQuery.eq("id", matchId);
  if (peerId) {
    matchQuery = matchQuery.or(
      `and(user_a.eq.${user.id},user_b.eq.${peerId}),and(user_a.eq.${peerId},user_b.eq.${user.id})`,
    );
  }

  const { data: matches, error: findErr } = await matchQuery.limit(1);
  if (findErr) return jsonError("INTERNAL", null, requestId);
  const match = matches?.[0];
  if (!match) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "unmatchNotFound", requestId);
  }

  const other =
    match.user_a === user.id ? match.user_b : match.user_a;

  const { data: conv } = await admin
    .from("conversations")
    .select("id")
    .eq("mutual_match_id", match.id)
    .maybeSingle();

  if (conv?.id) {
    await admin.from("conversation_reads").delete().eq("conversation_id", conv.id);
    await admin.from("messages").delete().eq("conversation_id", conv.id);
    await admin.from("conversations").delete().eq("id", conv.id);
  }

  await admin.from("mutual_matches").delete().eq("id", match.id);

  await admin
    .from("likes")
    .delete()
    .or(
      `and(actor_id.eq.${user.id},target_id.eq.${other}),and(actor_id.eq.${other},target_id.eq.${user.id})`,
    );

  try {
    await admin.rpc("enqueue_outbox", {
      p_event_id: `match.unmatch:${match.id}`,
      p_event_type: "match.unmatch",
      p_payload: {
        match_id: match.id,
        actor_id: user.id,
        peer_id: other,
      },
    });
  } catch {
    // outbox optional
  }

  return NextResponse.json({
    data: { unmatched: true, match_id: match.id, peer_id: other },
    meta: { request_id: requestId },
  });
}
