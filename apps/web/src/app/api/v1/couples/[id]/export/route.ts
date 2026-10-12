import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

/** DM-040 soft export: shared pins JSON for active pair members (no private notes). */
export async function GET(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: pair } = await supabase
    .from("pairs")
    .select("id, status, user_a, user_b, created_at")
    .eq("id", coupleId)
    .eq("status", "active")
    .maybeSingle();
  if (!pair || (pair.user_a !== user.id && pair.user_b !== user.id)) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const { data: pins, error } = await supabase
    .from("pins")
    .select(
      "id, layer, title, note, place_label, lat, lng, visited_on, created_at",
    )
    .eq("pair_id", coupleId)
    .order("created_at", { ascending: true });
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: {
      exported_at: new Date().toISOString(),
      pair_id: coupleId,
      pair_created_at: pair.created_at,
      pins: pins ?? [],
    },
    meta: { request_id: requestId },
  });
}
