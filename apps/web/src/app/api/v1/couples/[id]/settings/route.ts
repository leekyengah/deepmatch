import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: pair } = await supabase
    .from("pairs")
    .select("id, user_a, user_b, status")
    .eq("id", coupleId)
    .maybeSingle();

  if (!pair || pair.status !== "active") {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }
  if (pair.user_a !== user.id && pair.user_b !== user.id) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  let body: {
    space_title?: string | null;
    motto?: string | null;
    started_on?: string | null;
    cover_path?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const patch: Record<string, string | null> = {};
  if ("space_title" in body) {
    const v = body.space_title?.trim() || null;
    if (v && v.length > 80) {
      return jsonError("VALIDATION_ERROR", "spaceTitleTooLong", requestId);
    }
    patch.space_title = v;
  }
  if ("motto" in body) {
    const v = body.motto?.trim() || null;
    if (v && v.length > 200) {
      return jsonError("VALIDATION_ERROR", "mottoTooLong", requestId);
    }
    patch.motto = v;
  }
  if ("started_on" in body) {
    const v = body.started_on?.trim() || null;
    if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return jsonError("VALIDATION_ERROR", "startedOnInvalid", requestId);
    }
    patch.started_on = v;
  }
  if ("cover_path" in body) {
    patch.cover_path = body.cover_path?.trim() || null;
  }

  if (!Object.keys(patch).length) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const { data, error } = await supabase
    .from("pairs")
    .update(patch)
    .eq("id", coupleId)
    .eq("status", "active")
    .select("id, space_title, cover_path, motto, started_on")
    .maybeSingle();

  if (error) {
    return jsonError("VALIDATION_ERROR", error.message, requestId);
  }

  return NextResponse.json({
    data: { pair: data },
    meta: { request_id: requestId },
  });
}
