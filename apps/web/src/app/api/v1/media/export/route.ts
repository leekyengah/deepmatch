import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";
import { getStorageBackend, type StorageBackend } from "@/lib/media/limits";
import { createSignedReadUrl } from "@/lib/media/storage";

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
    .select(
      "id, storage_path, content_type, bytes, pair_id, created_at, storage_backend, processing_status",
    )
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    const legacy = await supabase
      .from("media_objects")
      .select("id, storage_path, content_type, bytes, pair_id, created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (legacy.error) return jsonError("VALIDATION_ERROR", null, requestId);
    return packExport(legacy.data ?? [], requestId);
  }

  return packExport(rows ?? [], requestId);
}

async function packExport(
  rows: Array<{
    id: string;
    storage_path: string;
    content_type: string;
    bytes: number;
    pair_id: string | null;
    created_at: string;
    storage_backend?: string;
    processing_status?: string;
  }>,
  requestId: string,
) {
  const items = [];
  for (const row of rows) {
    if (row.processing_status && row.processing_status !== "ready") {
      items.push({
        id: row.id,
        content_type: row.content_type,
        bytes: row.bytes,
        pair_id: row.pair_id,
        created_at: row.created_at,
        download_url: null,
        expires_in_seconds: 300,
        processing_status: row.processing_status,
      });
      continue;
    }
    const backend = (row.storage_backend ??
      getStorageBackend()) as StorageBackend;
    const download_url = await createSignedReadUrl(
      row.storage_path,
      backend,
      300,
    );
    items.push({
      id: row.id,
      content_type: row.content_type,
      bytes: row.bytes,
      pair_id: row.pair_id,
      created_at: row.created_at,
      download_url,
      expires_in_seconds: 300,
      processing_status: row.processing_status ?? "ready",
    });
  }

  return NextResponse.json({
    data: {
      items,
      retention_note: await apiT("mediaExportNote"),
    },
    meta: { request_id: requestId },
  });
}
