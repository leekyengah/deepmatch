import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

async function assertMember(
  supabase: Awaited<ReturnType<typeof getRouteUser>>["supabase"],
  userId: string,
  coupleId: string,
) {
  const { data: pair } = await supabase
    .from("pairs")
    .select("id, user_a, user_b, status")
    .eq("id", coupleId)
    .maybeSingle();
  if (!pair || pair.status !== "active") return null;
  if (pair.user_a !== userId && pair.user_b !== userId) return null;
  return pair;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  if (!(await assertMember(supabase, user.id, coupleId))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const { data, error } = await supabase
    .from("couple_dates")
    .select(
      "id, title, starts_at, place_label, note, status, confirmed_a, confirmed_b, created_by, created_at",
    )
    .eq("pair_id", coupleId)
    .order("starts_at", { ascending: true });

  if (error) {
    return jsonError("VALIDATION_ERROR", error.message, requestId);
  }

  return NextResponse.json({
    data: { dates: data ?? [] },
    meta: { request_id: requestId },
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  const { id: coupleId } = await ctx.params;
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);
  const pair = await assertMember(supabase, user.id, coupleId);
  if (!pair) return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);

  let body: {
    title?: string;
    starts_at?: string;
    place_label?: string;
    note?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const title = body.title?.trim();
  const startsAt = body.starts_at?.trim();
  if (!title || !startsAt || Number.isNaN(Date.parse(startsAt))) {
    return jsonError("VALIDATION_ERROR", "dateRequired", requestId);
  }

  const isA = pair.user_a === user.id;
  const { data, error } = await supabase
    .from("couple_dates")
    .insert({
      pair_id: coupleId,
      title,
      starts_at: new Date(startsAt).toISOString(),
      place_label: body.place_label?.trim() || null,
      note: body.note?.trim() || null,
      status: "proposed",
      confirmed_a: isA,
      confirmed_b: !isA,
      created_by: user.id,
    })
    .select(
      "id, title, starts_at, place_label, note, status, confirmed_a, confirmed_b",
    )
    .maybeSingle();

  if (error) {
    return jsonError("VALIDATION_ERROR", error.message, requestId);
  }

  return NextResponse.json({
    data: { date: data },
    meta: { request_id: requestId },
  });
}
