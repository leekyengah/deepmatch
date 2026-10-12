import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";

/** DM-040: list own media with short-lived signed download URLs (export package metadata). */
export async function GET() {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_media_upload"))) {
    return jsonError("FORBIDDEN", "flagMediaOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: rows, error } = await supabase
    .from("media_objects")
    .select("id, storage_path, content_type, bytes, pair_id, created_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  const items = [];
  for (const row of rows ?? []) {
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrl(row.storage_path, 300);
    items.push({
      id: row.id,
      content_type: row.content_type,
      bytes: row.bytes,
      pair_id: row.pair_id,
      created_at: row.created_at,
      download_url: signed?.signedUrl ?? null,
      expires_in_seconds: 300,
    });
  }

  return NextResponse.json({
    data: {
      items,
      retention_note:
        await apiT("mediaExportNote"),
    },
    meta: { request_id: requestId },
  });
}
