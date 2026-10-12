import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";
import { randomUUID } from "node:crypto";

const IMAGE_MAX = 8 * 1024 * 1024; // 8MB
const VIDEO_MAX = 50 * 1024 * 1024; // 50MB soft limit (DM-035)
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

export async function POST(req: Request) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_media_upload"))) {
    return jsonError("FORBIDDEN", "flagMediaUploadOff", requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    content_type?: string;
    bytes?: number;
    pair_id?: string;
    conversation_id?: string;
  };

  if (!body.content_type || !ALLOWED.has(body.content_type)) {
    return jsonError("VALIDATION_ERROR", "unsupportedMediaType", requestId);
  }
  const isVideo = body.content_type.startsWith("video/");
  const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
  if (!body.bytes || body.bytes <= 0 || body.bytes > maxBytes) {
    return jsonError(
      "VALIDATION_ERROR",
      isVideo ? "videoTooLarge" : "imageTooLarge",
      requestId
    );
  }

  if (body.pair_id) {
    const { data: pair } = await supabase
      .from("pairs")
      .select("id, status, user_a, user_b")
      .eq("id", body.pair_id)
      .eq("status", "active")
      .maybeSingle();
    if (!pair || (pair.user_a !== user.id && pair.user_b !== user.id)) {
      return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
    }
  }

  const objectId = randomUUID();
  const ext = body.content_type.split("/")[1] ?? "bin";
  const storagePath = `${user.id}/${objectId}.${ext}`;

  const { data: media, error: mediaErr } = await supabase
    .from("media_objects")
    .insert({
      owner_user_id: user.id,
      pair_id: body.pair_id ?? null,
      conversation_id: body.conversation_id ?? null,
      storage_path: storagePath,
      content_type: body.content_type,
      bytes: body.bytes,
    })
    .select("id, storage_path")
    .single();
  if (mediaErr) return jsonError("VALIDATION_ERROR", mediaErr.message, requestId);

  const { data: signed, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUploadUrl(storagePath);

  if (signErr || !signed) {
    // Bucket may not exist yet — still return intent metadata for client
    return NextResponse.json({
      data: {
        media_id: media.id,
        storage_path: storagePath,
        upload: null,
        note: await apiT("mediaUploadNote"),
      },
      meta: { request_id: requestId },
    });
  }

  return NextResponse.json({
    data: {
      media_id: media.id,
      storage_path: storagePath,
      upload: {
        path: signed.path,
        token: signed.token,
        signed_url: signed.signedUrl,
      },
      expires_hint_seconds: 120,
    },
    meta: { request_id: requestId },
  });
}
