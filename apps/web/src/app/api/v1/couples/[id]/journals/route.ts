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

/** Journals are pin-scoped private_notes; list only notes visible to caller via RLS. */
export async function GET(req: Request, ctx: Ctx) {
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
  let pinQuery = supabase.from("pins").select("id").eq("pair_id", coupleId);
  if (pinId) pinQuery = pinQuery.eq("id", pinId);
  const { data: pins } = await pinQuery;
  const pinIds = (pins ?? []).map((p) => p.id);
  if (pinIds.length === 0) {
    return NextResponse.json({
      data: { journals: [] },
      meta: { request_id: requestId },
    });
  }

  const { data, error } = await supabase
    .from("private_notes")
    .select("id, pin_id, author_id, body, shared_with_partner, created_at")
    .in("pin_id", pinIds)
    .order("created_at", { ascending: false });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({
    data: { journals: data },
    meta: { request_id: requestId },
  });
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
    pin_id?: string;
    body?: string;
    shared_with_partner?: boolean;
  };
  if (!body.pin_id || !body.body?.trim()) {
    return jsonError("VALIDATION_ERROR", "missingPinJournal", requestId);
  }

  const { data: pin } = await supabase
    .from("pins")
    .select("id")
    .eq("id", body.pin_id)
    .eq("pair_id", coupleId)
    .maybeSingle();
  if (!pin) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const { data, error } = await supabase
    .from("private_notes")
    .insert({
      pin_id: body.pin_id,
      author_id: user.id,
      body: body.body.trim(),
      shared_with_partner: body.shared_with_partner === true,
    })
    .select("id, pin_id, shared_with_partner, created_at")
    .single();

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);
  return NextResponse.json({
    data: { journal: data },
    meta: { request_id: requestId },
  });
}
