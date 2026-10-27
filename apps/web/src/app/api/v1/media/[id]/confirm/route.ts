import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { getStorageBackend, type StorageBackend } from "@/lib/media/limits";
import { verifyAndProcessMedia } from "@/lib/media/process";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_media_upload"))) {
    return jsonError("FORBIDDEN", "flagMediaUploadOff", requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { id } = await ctx.params;
  if (!id) return jsonError("VALIDATION_ERROR", "invalidJson", requestId);

  const { data: media, error } = await supabase
    .from("media_objects")
    .select(
      "id, owner_user_id, storage_path, content_type, bytes, storage_backend, processing_status",
    )
    .eq("id", id)
    .maybeSingle();

  const row =
    media ??
    (
      await supabase
        .from("media_objects")
        .select("id, owner_user_id, storage_path, content_type, bytes")
        .eq("id", id)
        .maybeSingle()
    ).data;

  if (error && !row) return jsonError("INTERNAL", null, requestId);
  if (!row || row.owner_user_id !== user.id) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const existingStatus = (row as { processing_status?: string }).processing_status;
  if (existingStatus === "ready") {
    return NextResponse.json({
      data: {
        media_id: row.id,
        processing_status: "ready",
        storage_path: row.storage_path,
        content_type: row.content_type,
      },
      meta: { request_id: requestId },
    });
  }

  const backend = ((row as { storage_backend?: string }).storage_backend ??
    getStorageBackend()) as StorageBackend;

  await supabase
    .from("media_objects")
    .update({ processing_status: "processing" })
    .eq("id", row.id)
    .eq("owner_user_id", user.id);

  const result = await verifyAndProcessMedia({
    storagePath: row.storage_path,
    backend,
    claimedMime: row.content_type,
    claimedBytes: Number(row.bytes ?? 0),
  });

  if (!result.ok) {
    await supabase
      .from("media_objects")
      .update({
        processing_status: "failed",
        moderation_status: "rejected",
      })
      .eq("id", row.id)
      .eq("owner_user_id", user.id);

    const detail =
      result.error === "video_too_long"
        ? "videoTooLong"
        : result.error === "mime_mismatch"
          ? "unsupportedMediaType"
          : "mediaConfirmFailed";
    return jsonError("VALIDATION_ERROR", detail, requestId);
  }

  const patch: Record<string, unknown> = {
    processing_status: "ready",
    storage_path: result.storage_path ?? row.storage_path,
    content_type: result.mime_type ?? row.content_type,
    bytes: result.size_bytes ?? row.bytes,
    moderation_status: "pending",
  };
  if (result.width != null) patch.width = result.width;
  if (result.height != null) patch.height = result.height;
  if (result.duration_seconds != null) {
    patch.duration_seconds = result.duration_seconds;
  }
  if (result.thumb_path) patch.thumb_path = result.thumb_path;
  if (result.mime_type?.startsWith("video/")) patch.media_type = "video";
  if (result.mime_type?.startsWith("image/")) patch.media_type = "image";

  const { error: upErr } = await supabase
    .from("media_objects")
    .update(patch)
    .eq("id", row.id)
    .eq("owner_user_id", user.id);

  if (upErr) {
    await supabase
      .from("media_objects")
      .update({
        storage_path: result.storage_path ?? row.storage_path,
        content_type: result.mime_type ?? row.content_type,
        bytes: result.size_bytes ?? row.bytes,
      })
      .eq("id", row.id)
      .eq("owner_user_id", user.id);
  }

  return NextResponse.json({
    data: {
      media_id: row.id,
      processing_status: "ready",
      storage_path: result.storage_path ?? row.storage_path,
      content_type: result.mime_type ?? row.content_type,
      width: result.width ?? null,
      height: result.height ?? null,
      duration_seconds: result.duration_seconds ?? null,
      thumb_path: result.thumb_path ?? null,
    },
    meta: { request_id: requestId },
  });
}
