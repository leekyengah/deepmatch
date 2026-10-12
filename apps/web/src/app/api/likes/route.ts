import { NextResponse } from "next/server";
import { isMutual, mutualCreatesPairSpace } from "@deepmatch/shared";
import { getRouteUser } from "@/lib/supabase/route";
import { takeToken } from "@/lib/rate-limit";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const rl = takeToken(`likes:${user.id}`, 60, 60_000);
  if (!rl.ok) {
    return jsonError("RATE_LIMITED", null, requestId);
  }

  const body = (await req.json()) as {
    targetId?: string;
    action?: "like" | "pass";
  };
  if (!body.targetId || !body.action) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (body.targetId === user.id) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const { error } = await supabase.from("likes").upsert(
    {
      actor_id: user.id,
      target_id: body.targetId,
      action: body.action,
    },
    { onConflict: "actor_id,target_id" },
  );
  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  let mutual = false;
  let matchId: string | null = null;
  if (body.action === "like") {
    const { data: reverse } = await supabase
      .from("likes")
      .select("action")
      .eq("actor_id", body.targetId)
      .eq("target_id", user.id)
      .maybeSingle();

    mutual = isMutual({
      aLikesB: true,
      bLikesA: reverse?.action === "like",
    });

    if (mutual) {
      const a = user.id < body.targetId ? user.id : body.targetId;
      const b = user.id < body.targetId ? body.targetId : user.id;
      const { data: match } = await supabase
        .from("mutual_matches")
        .upsert({ user_a: a, user_b: b }, { onConflict: "user_a,user_b" })
        .select("id")
        .single();
      matchId = match?.id ?? null;
      if (matchId) {
        await supabase.from("conversations").upsert(
          { mutual_match_id: matchId },
          { onConflict: "mutual_match_id" },
        );
        await supabase.rpc("enqueue_outbox", {
          p_event_id: `match.mutual:${matchId}`,
          p_event_type: "match.mutual",
          p_payload: { match_id: matchId, user_a: a, user_b: b },
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    mutual,
    matchId,
    createsPairSpace: mutualCreatesPairSpace(),
  });
}
