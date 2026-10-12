import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("mutual_matches")
    .select("id, user_a, user_b, created_at, conversations(id)")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  const peerIds = (data ?? []).map((m) =>
    m.user_a === user.id ? m.user_b : m.user_a,
  );
  const { data: peers } = peerIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", peerIds)
    : { data: [] as { id: string; display_name: string }[] };
  const nameMap = new Map((peers ?? []).map((p) => [p.id, p.display_name]));

  const convIds = (data ?? [])
    .map((m) => {
      const conv = Array.isArray(m.conversations)
        ? m.conversations[0]
        : m.conversations;
      return conv?.id as string | undefined;
    })
    .filter((id): id is string => Boolean(id));

  const { data: reads } = convIds.length
    ? await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id)
        .in("conversation_id", convIds)
    : { data: [] as { conversation_id: string; last_read_at: string }[] };
  const readMap = new Map(
    (reads ?? []).map((r) => [r.conversation_id, r.last_read_at]),
  );

  const unreadMap = new Map<string, number>();
  for (const cid of convIds) {
    const since = readMap.get(cid);
    let q = supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", cid)
      .neq("sender_id", user.id);
    if (since) q = q.gt("created_at", since);
    const { count } = await q;
    unreadMap.set(cid, count ?? 0);
  }

  const peerDefault = await apiT("peerDefault");
  const matches = (data ?? []).map((m) => {
    const conv = Array.isArray(m.conversations)
      ? m.conversations[0]
      : m.conversations;
    const peerId = m.user_a === user.id ? m.user_b : m.user_a;
    const conversationId = conv?.id ?? null;
    return {
      match_id: m.id,
      user_a: m.user_a,
      user_b: m.user_b,
      peer_id: peerId,
      peer_name: nameMap.get(peerId) ?? peerDefault,
      conversation_id: conversationId,
      unread_count: conversationId ? (unreadMap.get(conversationId) ?? 0) : 0,
      created_at: m.created_at,
    };
  });

  return NextResponse.json({
    data: { matches },
    meta: { request_id: requestId },
  });
}
