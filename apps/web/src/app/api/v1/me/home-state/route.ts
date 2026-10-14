import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { resolveHomeState } from "@/lib/home-state";

/** EXT-051 — allowlisted home state (cookie web + Bearer mobile). */
export async function GET(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const result = await resolveHomeState(user.id, supabase);
  return NextResponse.json({
    ok: true,
    state: result.state,
    redirectTo: result.redirectTo,
    hasMutualMatch: result.hasMutualMatch,
    coupleActive: Boolean(result.coupleId),
    request_id: requestId,
  });
}
