import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const body = (await req.json()) as {
    target_user_id?: string;
    conversation_id?: string;
    message_id?: string;
    reason?: string;
  };
  if (!body.reason?.trim()) {
    return jsonError("VALIDATION_ERROR", "missingReportReason", requestId);
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_user_id: body.target_user_id ?? null,
      conversation_id: body.conversation_id ?? null,
      message_id: body.message_id ?? null,
      reason: body.reason.trim(),
    })
    .select("id, status, created_at")
    .single();

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  return NextResponse.json({
    data: { report_id: data.id, status: data.status },
    meta: { request_id: requestId },
  });
}
