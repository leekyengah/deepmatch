import { NextResponse, type NextRequest } from "next/server";
import { getRouteUser, createServiceClient } from "@/lib/supabase/route";
import { flagEnabled } from "@/lib/flags";
import { jsonError, makeRequestId } from "@/lib/api-error";
import {
  getStorageBackend,
  PRESIGN_GET_TTL_SECONDS,
  type StorageBackend,
} from "@/lib/media/limits";
import { createSignedReadUrl } from "@/lib/media/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const requestId = makeRequestId();
  if (!(await flagEnabled("ff_media_upload"))) {
    return jsonError("FORBIDDEN", "flagMediaUploadOff", requestId);
  }

  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { id } = await ctx.params;
  const { data: media } = await supabase
    .from("media_objects")
    .select(
      "id, owner_user_id, pair_id, conversation_id, storage_path, content_type, storage_backend, processing_status, visibility, deleted_at",
    )
    .eq("id", id)
    .maybeSingle();

  const row =
    media ??
    (
      await supabase
        .from("media_objects")
        .select(
          "id, owner_user_id, pair_id, conversation_id, storage_path, content_type",
        )
        .eq("id", id)
        .maybeSingle()
    ).data;

  if (!row) return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  if ((row as { deleted_at?: string | null }).deleted_at) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const status = (row as { processing_status?: string }).processing_status;
  if (status && status !== "ready") {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "mediaNotReady", requestId);
  }

  const allowed = await canReadMedia(user.id, row);
  if (!allowed) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);
  }

  const backend = ((row as { storage_backend?: string }).storage_backend ??
    getStorageBackend()) as StorageBackend;
  const url = await createSignedReadUrl(
    row.storage_path,
    backend,
    PRESIGN_GET_TTL_SECONDS,
  );
  if (!url) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: {
      media_id: row.id,
      content_type: row.content_type,
      url,
      expires_in_seconds: PRESIGN_GET_TTL_SECONDS,
    },
    meta: { request_id: requestId },
  });
}

async function canReadMedia(
  userId: string,
  row: {
    owner_user_id: string;
    pair_id?: string | null;
    conversation_id?: string | null;
    visibility?: string | null;
  },
): Promise<boolean> {
  if (row.owner_user_id === userId) return true;
  if (row.visibility === "public") return true;

  if (row.pair_id) {
    const admin = createServiceClient();
    const { data: pair } = await admin
      .from("pairs")
      .select("id, status, user_a, user_b")
      .eq("id", row.pair_id)
      .eq("status", "active")
      .maybeSingle();
    if (pair && (pair.user_a === userId || pair.user_b === userId)) return true;
  }

  if (row.conversation_id) {
    const admin = createServiceClient();
    const { data: conv } = await admin
      .from("conversations")
      .select("id, mutual_matches(user_a, user_b)")
      .eq("id", row.conversation_id)
      .maybeSingle();
    const match = Array.isArray(conv?.mutual_matches)
      ? conv?.mutual_matches[0]
      : conv?.mutual_matches;
    if (match && (match.user_a === userId || match.user_b === userId)) {
      return true;
    }
  }

  return false;
}
