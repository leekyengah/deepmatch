import { NextResponse } from "next/server";
import { createServiceClient, getRouteUser } from "@/lib/supabase/route";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";

/**
 * Apple 5.1.1 — account deletion from within the app.
 * Soft-anonymizes profile then deletes Auth user via service role.
 */
export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return jsonError(
      "VALIDATION_ERROR",
      "deleteConfirmRequired",
      requestId
    );
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return jsonError("INTERNAL", null, requestId);
  }

  const now = new Date().toISOString();
  await admin
    .from("profiles")
    .update({
      display_name: await apiT("auth.deletedDisplayName"),
      bio: null,
      avatar_path: null,
      job_title: null,
      fuzzy_region: null,
      discovery_opt_in: false,
      hidden_from_discovery: true,
      suspended: true,
      updated_at: now,
    })
    .eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return jsonError("INTERNAL", null, requestId);
  }

  return NextResponse.json({
    data: { deleted: true },
    meta: { request_id: requestId },
  });
}
