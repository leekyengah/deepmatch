import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { isStaffUser } from "@/lib/staff";
import { LOVE_PLACES } from "@/lib/love-places";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await isStaffUser(supabase, user))) {
    return jsonError("FORBIDDEN", null, requestId);
  }

  const [{ data: flags }, { data: queue }] = await Promise.all([
    supabase.from("venue_admin_flags").select("place_id, closed, notes, updated_at"),
    supabase
      .from("venue_moderation_queue")
      .select(
        "id, place_id, review_id, status, reason, created_at, resolved_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const flagMap = new Map((flags ?? []).map((f) => [f.place_id, f]));
  const venues = LOVE_PLACES.map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    closed: Boolean(flagMap.get(p.id)?.closed),
    notes: flagMap.get(p.id)?.notes ?? null,
    review_count: p.reviews?.length ?? 0,
    sample: true as const,
  }));

  return NextResponse.json({
    data: {
      venues,
      queue: queue ?? [],
    },
    meta: { request_id: requestId },
  });
}

export async function PATCH(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await isStaffUser(supabase, user))) {
    return jsonError("FORBIDDEN", null, requestId);
  }

  let body: {
    place_id?: string;
    closed?: boolean;
    notes?: string;
    queue_id?: string;
    queue_action?: "removed" | "dismissed";
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  if (body.queue_id && body.queue_action) {
    const { data, error } = await supabase
      .from("venue_moderation_queue")
      .update({
        status: body.queue_action,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", body.queue_id)
      .eq("status", "open")
      .select("id, place_id, review_id, status")
      .maybeSingle();
    if (error || !data) {
      return jsonError("VALIDATION_ERROR", "bookingNotFound", requestId);
    }
    return NextResponse.json({
      data: { item: data },
      meta: { request_id: requestId },
    });
  }

  if (!body.place_id || typeof body.closed !== "boolean") {
    return jsonError("VALIDATION_ERROR", "contactFieldsRequired", requestId);
  }
  if (!LOVE_PLACES.some((p) => p.id === body.place_id)) {
    return jsonError("VALIDATION_ERROR", "productNotFound", requestId);
  }

  const { data, error } = await supabase
    .from("venue_admin_flags")
    .upsert(
      {
        place_id: body.place_id,
        closed: body.closed,
        notes: body.notes?.slice(0, 500) ?? null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "place_id" },
    )
    .select("place_id, closed, notes")
    .single();
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { flag: data },
    meta: { request_id: requestId },
  });
}

export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { place_id?: string; review_id?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.place_id || !body.review_id) {
    return jsonError("VALIDATION_ERROR", "contactFieldsRequired", requestId);
  }
  const place = LOVE_PLACES.find((p) => p.id === body.place_id);
  if (!place?.reviews?.some((r) => r.id === body.review_id)) {
    return jsonError("VALIDATION_ERROR", "productNotFound", requestId);
  }

  // BFF insert via service role after auth — avoids JWT/RLS edge cases on report path
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("venue_moderation_queue")
    .insert({
      place_id: body.place_id,
      review_id: body.review_id,
      status: "open",
      reason: body.reason?.slice(0, 300) ?? "user_report",
      reporter_id: user.id,
    })
    .select("id, place_id, review_id, status")
    .single();
  if (error) {
    const msg = String(error.message || error.code || "");
    if (msg.includes("duplicate") || error.code === "23505") {
      return NextResponse.json({
        data: { reported: true, duplicate: true },
        meta: { request_id: requestId },
      });
    }
    return jsonError("INTERNAL", null, requestId);
  }

  return NextResponse.json({
    data: { item: data },
    meta: { request_id: requestId },
  });
}
