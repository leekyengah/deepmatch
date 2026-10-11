import { NextResponse } from "next/server";
import { isMutual, mutualCreatesPairSpace } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    targetId?: string;
    action?: "like" | "pass";
  };
  if (!body.targetId || !body.action) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.targetId === user.id) {
    return NextResponse.json({ error: "self" }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 400 });
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
