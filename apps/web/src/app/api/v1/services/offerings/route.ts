import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET() {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_concierge"))) {
    return jsonError("FORBIDDEN", "flagConciergeOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("service_offerings")
    .select("id, title, description, active")
    .eq("active", true)
    .order("title", { ascending: true });

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { offerings: data ?? [] },
    meta: { request_id: requestId },
  });
}
