import { NextResponse } from "next/server";
import { canAccessChat } from "@deepmatch/shared";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend } from "@/lib/media/limits";

/** Allowlisted peer public fields for chat context — only after mutual chat access. */
export async function GET(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_chat"))) {
    return jsonError("FORBIDDEN", "flagChatOff", requestId);
  }
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const conversationId = new URL(req.url).searchParams.get("conversationId");
  if (!conversationId) {
    return jsonError("VALIDATION_ERROR", "missingConversationId", requestId);
  }

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, mutual_match_id, mutual_matches(user_a, user_b)")
    .eq("id", conversationId)
    .maybeSingle();

  const match = Array.isArray(conv?.mutual_matches)
    ? conv?.mutual_matches[0]
    : conv?.mutual_matches;
  const isParticipant =
    !!match && (match.user_a === user.id || match.user_b === user.id);
  const peerId =
    match && match.user_a === user.id ? match.user_b : match?.user_a;

  let blocked = false;
  if (peerId) {
    const admin = createServiceClient();
    const { data: blocks } = await admin
      .from("blocks")
      .select("blocker_id")
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${peerId}),and(blocker_id.eq.${peerId},blocked_id.eq.${user.id})`,
      )
      .limit(1);
    blocked = Boolean(blocks?.length);
  }

  const { data: meProfile } = await supabase
    .from("profiles")
    .select("suspended")
    .eq("id", user.id)
    .maybeSingle();

  const access = canAccessChat({
    isAuthenticated: true,
    isParticipant,
    isMutualMatch: Boolean(match),
    isBlockedEitherWay: blocked,
    chatFlagEnabled: true,
    userSuspended: Boolean(meProfile?.suspended),
  });
  if (!access.allowed || !peerId) {
    return NextResponse.json(
      { allowed: false, reason: access.reason ?? "denied" },
      { status: 403 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, bio, fuzzy_region, job_title, avatar_path, birth_date")
    .eq("id", peerId)
    .maybeSingle();

  const { data: deep } = await supabase
    .from("profile_deep")
    .select("goals, values, interests")
    .eq("user_id", peerId)
    .maybeSingle();

  const { data: meDeep } = await supabase
    .from("profile_deep")
    .select("goals, values, interests")
    .eq("user_id", user.id)
    .maybeSingle();

  let avatarUrl: string | null = null;
  if (profile?.avatar_path) {
    try {
      avatarUrl = await createSignedReadUrl(
        profile.avatar_path,
        getStorageBackend(),
        600,
      );
    } catch {
      avatarUrl = null;
    }
  }

  const shared = (a: string[] = [], b: string[] = []) =>
    a.filter((x) => b.includes(x)).slice(0, 8);

  return NextResponse.json({
    ok: true,
    peer: {
      id: peerId,
      displayName: profile?.display_name ?? null,
      bio: profile?.bio ?? null,
      region: profile?.fuzzy_region ?? null,
      jobTitle: profile?.job_title ?? null,
      avatarUrl,
      goals: deep?.goals ?? [],
      values: deep?.values ?? [],
      interests: deep?.interests ?? [],
      shared: {
        interests: shared(meDeep?.interests ?? [], deep?.interests ?? []),
        values: shared(meDeep?.values ?? [], deep?.values ?? []),
        goals: shared(meDeep?.goals ?? [], deep?.goals ?? []),
      },
    },
    meta: { request_id: requestId },
  });
}
