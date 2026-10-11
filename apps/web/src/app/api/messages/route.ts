import { NextResponse } from "next/server";
import { canAccessChat } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId_required" }, { status: 400 });
  }

  const allowed = await assertChatAccess(supabase, user.id, conversationId);
  if (!allowed.allowed) {
    return NextResponse.json(allowed, { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, client_dedupe_key")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ messages: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    conversationId?: string;
    text?: string;
    clientDedupeKey?: string;
  };
  if (!body.conversationId || !body.text?.trim()) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const allowed = await assertChatAccess(supabase, user.id, body.conversationId);
  if (!allowed.allowed) {
    return NextResponse.json(allowed, { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .upsert(
      {
        conversation_id: body.conversationId,
        sender_id: user.id,
        body: body.text.trim(),
        client_dedupe_key: body.clientDedupeKey ?? null,
      },
      { onConflict: "conversation_id,client_dedupe_key", ignoreDuplicates: true },
    )
    .select("id, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ message: data });
}

async function assertChatAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  conversationId: string,
) {
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, mutual_match_id, mutual_matches(user_a, user_b)")
    .eq("id", conversationId)
    .maybeSingle();

  const match = Array.isArray(conv?.mutual_matches)
    ? conv?.mutual_matches[0]
    : conv?.mutual_matches;
  const isParticipant =
    !!match && (match.user_a === userId || match.user_b === userId);

  const otherId =
    match && match.user_a === userId ? match.user_b : match?.user_a;

  let blocked = false;
  if (otherId) {
    const { data: blocks } = await supabase
      .from("blocks")
      .select("blocker_id")
      .or(
        `and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`,
      )
      .limit(1);
    blocked = (blocks?.length ?? 0) > 0;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("suspended")
    .eq("id", userId)
    .maybeSingle();

  return canAccessChat({
    isAuthenticated: true,
    isMutualMatch: !!match,
    isParticipant,
    isBlockedEitherWay: blocked,
    chatFlagEnabled: flagEnabled("ff_chat"),
    userSuspended: Boolean(profile?.suspended),
  });
}
