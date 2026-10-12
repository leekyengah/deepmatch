import { NextResponse } from "next/server";
import { canAccessChat } from "@deepmatch/shared";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: Request) {
  const { supabase, user } = await getRouteUser(req);
  const requestId = makeRequestId();
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) {
    return jsonError("VALIDATION_ERROR", "missingConversationId", requestId);
  }

  const allowed = await assertChatAccess(supabase, user.id, conversationId);
  if (!allowed.allowed) {
    return NextResponse.json(allowed, { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, body, media_id, created_at, client_dedupe_key")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const mediaIds = [
    ...new Set(
      (data ?? [])
        .map((m) => m.media_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const { data: mediaRows } = mediaIds.length
    ? await supabase
        .from("media_objects")
        .select("id, storage_path, content_type")
        .in("id", mediaIds)
    : {
        data: [] as {
          id: string;
          storage_path: string;
          content_type: string;
        }[],
      };

  const mediaMeta = new Map<
    string,
    { url: string; content_type: string }
  >();
  for (const row of mediaRows ?? []) {
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrl(row.storage_path, 600);
    if (signed?.signedUrl) {
      mediaMeta.set(row.id, {
        url: signed.signedUrl,
        content_type: row.content_type,
      });
    }
  }

  const messages = (data ?? []).map((m) => {
    const meta = m.media_id ? mediaMeta.get(m.media_id) : undefined;
    return {
      ...m,
      media_url: meta?.url ?? null,
      media_content_type: meta?.content_type ?? null,
    };
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const body = (await req.json()) as {
    conversationId?: string;
    text?: string;
    mediaId?: string;
    clientDedupeKey?: string;
  };
  const text = body.text?.trim() ?? "";
  if (!body.conversationId || (!text && !body.mediaId)) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const allowed = await assertChatAccess(supabase, user.id, body.conversationId);
  if (!allowed.allowed) {
    return NextResponse.json(allowed, { status: 403 });
  }

  if (body.mediaId) {
    const { data: media } = await supabase
      .from("media_objects")
      .select("id, owner_user_id")
      .eq("id", body.mediaId)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (!media) {
      return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .upsert(
      {
        conversation_id: body.conversationId,
        sender_id: user.id,
        body: text || null,
        media_id: body.mediaId ?? null,
        client_dedupe_key: body.clientDedupeKey ?? null,
      },
      { onConflict: "conversation_id,client_dedupe_key", ignoreDuplicates: true },
    )
    .select("id, created_at")
    .maybeSingle();

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }
  return NextResponse.json({ message: data });
}

async function assertChatAccess(
  supabase: Awaited<ReturnType<typeof getRouteUser>>["supabase"],
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
    // Service role: blocked party cannot see blocker-owned rows under blocks_self RLS
    const admin = createServiceClient();
    const { data: blocks } = await admin
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
    chatFlagEnabled: await flagEnabled("ff_chat"),
    userSuspended: Boolean(profile?.suspended),
  });
}
