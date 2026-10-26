import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

/** Returns the caller's active pair id (for date planning from DateMap). */
export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: pair, error } = await supabase
    .from("pairs")
    .select("id, status")
    .eq("status", "active")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (error) {
    return jsonError("VALIDATION_ERROR", error.message, requestId);
  }

  return NextResponse.json({
    data: { couple: pair ? { id: pair.id } : null },
    meta: { request_id: requestId },
  });
}
