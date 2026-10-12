import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError, makeRequestId } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

async function assertPairMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  coupleId: string,
) {
  const { data } = await supabase
    .from("pairs")
    .select("id, status, user_a, user_b")
    .eq("id", coupleId)
    .eq("status", "active")
    .maybeSingle();
  if (!data) return false;
  return data.user_a === userId || data.user_b === userId;
}

export async function GET(_req: Request, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await assertPairMember(supabase, user.id, coupleId))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const { data, error } = await supabase
    .from("pins")
    .select(
      "id, layer, title, note, lat, lng, place_label, visited_on, created_by, created_at",
    )
    .eq("pair_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({ data: { pins: data }, meta: { request_id: requestId } });
}

export async function POST(req: Request, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await assertPairMember(supabase, user.id, coupleId))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const body = (await req.json()) as {
    title?: string;
    layer?: "visited" | "wishlist" | "milestone";
    note?: string;
    occurred_on?: string;
    location?: { name?: string; latitude?: number; longitude?: number };
  };
  if (!body.title?.trim() || !body.layer) {
    return jsonError("VALIDATION_ERROR", "missingPinFields", requestId);
  }

  const { data, error } = await supabase
    .from("pins")
    .insert({
      pair_id: coupleId,
      layer: body.layer,
      title: body.title.trim(),
      note: body.note ?? null,
      place_label: body.location?.name ?? null,
      lat: body.location?.latitude ?? null,
      lng: body.location?.longitude ?? null,
      visited_on: body.occurred_on ?? null,
      created_by: user.id,
    })
    .select("id, layer, title, created_at")
    .single();

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({ data: { pin: data }, meta: { request_id: requestId } });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await assertPairMember(supabase, user.id, coupleId))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const body = (await req.json()) as {
    pin_id?: string;
    layer?: "visited" | "wishlist" | "milestone";
    title?: string;
    note?: string;
    place_label?: string;
  };
  if (!body.pin_id) {
    return jsonError("VALIDATION_ERROR", "missingPinId", requestId);
  }

  const patch: Record<string, unknown> = {};
  if (body.layer) patch.layer = body.layer;
  if (body.title?.trim()) patch.title = body.title.trim();
  if (body.note !== undefined) patch.note = body.note;
  if (body.place_label !== undefined) patch.place_label = body.place_label;

  if (Object.keys(patch).length === 0) {
    return jsonError("VALIDATION_ERROR", "noUpdateFields", requestId);
  }

  const { data, error } = await supabase
    .from("pins")
    .update(patch)
    .eq("id", body.pin_id)
    .eq("pair_id", coupleId)
    .select("id, layer, title, place_label")
    .single();

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({ data: { pin: data }, meta: { request_id: requestId } });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await assertPairMember(supabase, user.id, coupleId))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const pinId = new URL(req.url).searchParams.get("pin_id");
  if (!pinId) {
    return jsonError("VALIDATION_ERROR", "missingPinId", requestId);
  }

  const { error } = await supabase
    .from("pins")
    .delete()
    .eq("id", pinId)
    .eq("pair_id", coupleId)
    .eq("created_by", user.id);

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({ data: { deleted: true }, meta: { request_id: requestId } });
}
