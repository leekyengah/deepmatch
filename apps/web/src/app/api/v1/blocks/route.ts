import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as { blocked_user_id?: string };
  if (!body.blocked_user_id || body.blocked_user_id === user.id) {
    return jsonError("VALIDATION_ERROR", "invalidBlockTarget", requestId);
  }

  const { error } = await supabase.from("blocks").upsert({
    blocker_id: user.id,
    blocked_id: body.blocked_user_id,
  });
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { blocked_user_id: body.blocked_user_id },
    meta: { request_id: requestId },
  });
}

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("blocks")
    .select("blocked_id, created_at")
    .eq("blocker_id", user.id);
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { blocks: data ?? [] },
    meta: { request_id: requestId },
  });
}

export async function DELETE(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { blocked_user_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (!body.blocked_user_id) {
    return jsonError("VALIDATION_ERROR", "invalidBlockTarget", requestId);
  }

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", body.blocked_user_id);
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { unblocked_user_id: body.blocked_user_id },
    meta: { request_id: requestId },
  });
}
