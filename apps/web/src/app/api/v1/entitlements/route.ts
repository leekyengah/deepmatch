import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "id, sku, package_code, status, quota_total, quota_used, starts_at, ends_at, sandbox, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { entitlements: data ?? [] },
    meta: { request_id: requestId },
  });
}
