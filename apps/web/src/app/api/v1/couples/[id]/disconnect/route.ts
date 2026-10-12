import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const { data: pair, error: readErr } = await supabase
    .from("pairs")
    .select("id, user_a, user_b, status")
    .eq("id", coupleId)
    .maybeSingle();

  if (readErr || !pair) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }
  if (pair.user_a !== user.id && pair.user_b !== user.id) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }
  if (pair.status !== "active") {
    return jsonError("CONFLICT", "coupleInactive", requestId);
  }

  const { error } = await supabase
    .from("pairs")
    .update({ status: "unpaired", unpaired_at: new Date().toISOString() })
    .eq("id", coupleId)
    .eq("status", "active");

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "pair.disconnect",
    entity_type: "pairs",
    entity_id: coupleId,
    reason: "member_initiated",
  });

  return NextResponse.json({
    data: { couple_id: coupleId, status: "DISCONNECTED" },
    meta: { request_id: requestId },
  });
}
