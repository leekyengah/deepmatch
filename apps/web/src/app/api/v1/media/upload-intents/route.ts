import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError, makeRequestId } from "@/lib/api-error";
import {
  ALLOWED_MIME,
  IMAGE_MAX_BYTES,
  PROFILE_MAX_IMAGES,
  PROFILE_MAX_VIDEOS,
  VIDEO_MAX_BYTES,
  getStorageBackend,
} from "@/lib/media/limits";
import {
  buildR2ObjectKey,
  buildSupabaseStoragePath,
  derivePurpose,
} from "@/lib/media/keys";
import { createUploadIntent } from "@/lib/media/storage";
import { lovePlaceById } from "@/lib/love-places";
import { companionByCode, companionBySlug } from "@/lib/companion-packages";

export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_media_upload"))) {
    return jsonError("FORBIDDEN", "flagMediaUploadOff", requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    content_type?: string;
    bytes?: number;
    pair_id?: string;
    conversation_id?: string;
    purpose?: string;
    place_id?: string;
    service_id?: string;
  };

  if (!body.content_type || !ALLOWED_MIME.has(body.content_type)) {
    return jsonError("VALIDATION_ERROR", "unsupportedMediaType", requestId);
  }
  const isVideo = body.content_type.startsWith("video/");
  const maxBytes = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (!body.bytes || body.bytes <= 0 || body.bytes > maxBytes) {
    return jsonError(
      "VALIDATION_ERROR",
      isVideo ? "videoTooLarge" : "imageTooLarge",
      requestId,
    );
  }

  if (body.place_id && !lovePlaceById(body.place_id)) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }
  if (
    body.service_id &&
    !companionByCode(body.service_id) &&
    !companionBySlug(body.service_id)
  ) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const isProfileLibrary =
    !body.pair_id &&
    !body.conversation_id &&
    !body.place_id &&
    !body.service_id &&
    body.purpose !== "avatar" &&
    body.purpose !== "place_review" &&
    body.purpose !== "service";

  if (isProfileLibrary) {
    const { data: existing } = await supabase
      .from("media_objects")
      .select("content_type")
      .eq("owner_user_id", user.id)
      .is("pair_id", null)
      .is("conversation_id", null)
      .limit(50);
    const rows = existing ?? [];
    const images = rows.filter((r) =>
      String(r.content_type || "").startsWith("image/"),
    ).length;
    const videos = rows.filter((r) =>
      String(r.content_type || "").startsWith("video/"),
    ).length;
    if (!isVideo && images >= PROFILE_MAX_IMAGES) {
      return jsonError("VALIDATION_ERROR", "imageTooLarge", requestId);
    }
    if (isVideo && videos >= PROFILE_MAX_VIDEOS) {
      return jsonError("VALIDATION_ERROR", "videoTooLarge", requestId);
    }
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

  const backend = getStorageBackend();
  const purpose = derivePurpose({
    pairId: body.pair_id,
    conversationId: body.conversation_id,
    purpose: body.purpose,
    placeId: body.place_id,
    serviceId: body.service_id,
  });
  const storagePath =
    backend === "r2"
      ? buildR2ObjectKey({
          purpose,
          userId: user.id,
          mime: body.content_type,
          pairId: body.pair_id,
          placeId: body.place_id,
          serviceId: body.service_id,
        })
      : buildSupabaseStoragePath(user.id, body.content_type);

  const visibility =
    purpose === "place_review"
      ? "public"
      : body.pair_id
        ? "couple_private"
        : "private";

  const purposeDb =
    purpose === "avatar"
      ? "avatar"
      : purpose === "chat"
        ? "chat"
        : purpose === "place_review"
          ? "place_review"
          : purpose === "service"
            ? "service"
            : purpose === "couple"
              ? "couple"
              : "profile";

  const insertRow: Record<string, unknown> = {
    owner_user_id: user.id,
    pair_id: body.pair_id ?? null,
    conversation_id: body.conversation_id ?? null,
    storage_path: storagePath,
    content_type: body.content_type,
    bytes: body.bytes,
    purpose: purposeDb,
    storage_backend: backend,
    processing_status: "pending_upload",
    visibility,
    media_type: isVideo ? "video" : "image",
    entity_type: body.place_id
      ? "place"
      : body.service_id
        ? "service"
        : null,
    entity_ref: body.place_id ?? body.service_id ?? null,
  };

  const { data: media, error: mediaErr } = await supabase
    .from("media_objects")
    .insert(insertRow)
    .select("id, storage_path")
    .single();

  if (mediaErr) {
    const { data: legacy, error: legacyErr } = await supabase
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
    if (legacyErr || !legacy) {
      return jsonError("VALIDATION_ERROR", "unsupportedMediaType", requestId);
    }
    return respondIntent(
      legacy.id,
      storagePath,
      body.content_type,
      backend,
      requestId,
    );
  }

  return respondIntent(
    media.id,
    storagePath,
    body.content_type,
    backend,
    requestId,
  );
}

async function respondIntent(
  mediaId: string,
  storagePath: string,
  contentType: string,
  backend: "supabase" | "r2",
  requestId: string,
) {
  try {
    const upload = await createUploadIntent({
      storagePath,
      contentType,
      backend,
    });
    return NextResponse.json({
      data: {
        media_id: mediaId,
        storage_path: storagePath,
        backend: upload.backend,
        upload: {
          path: upload.path,
          token: upload.token,
          url: upload.url,
          method: upload.method,
          headers: upload.headers,
          signed_url: upload.url,
        },
        expires_hint_seconds: upload.expires_in,
      },
      meta: { request_id: requestId },
    });
  } catch {
    return NextResponse.json({
      data: {
        media_id: mediaId,
        storage_path: storagePath,
        backend,
        upload: null,
        note: await apiT("mediaUploadNote"),
      },
      meta: { request_id: requestId },
    });
  }
}
