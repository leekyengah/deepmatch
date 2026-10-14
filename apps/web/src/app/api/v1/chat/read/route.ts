import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { flagEnabled } from "@/lib/flags";

export async function POST(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_chat"))) {
    return jsonError("FORBIDDEN", "flagChatOff", requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as { conversation_id?: string };
  if (!body.conversation_id) {
    return jsonError("VALIDATION_ERROR", "missingConversationId", requestId);
  }

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, mutual_match_id, mutual_matches(user_a, user_b)")
    .eq("id", body.conversation_id)
    .maybeSingle();

  const mm = Array.isArray(conv?.mutual_matches)
    ? conv?.mutual_matches[0]
    : conv?.mutual_matches;
  if (
    !conv ||
    !mm ||
    (mm.user_a !== user.id && mm.user_b !== user.id)
  ) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("conversation_reads").upsert({
    conversation_id: body.conversation_id,
    user_id: user.id,
    last_read_at: now,
  });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { conversation_id: body.conversation_id, last_read_at: now },
    meta: { request_id: requestId },
  });
}
