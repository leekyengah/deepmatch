import { randomUUID } from "node:crypto";

export type MediaPurpose =
  | "avatar"
  | "profile"
  | "chat"
  | "couple"
  | "place_review"
  | "service"
  | "banner"
  | "temp";

function extForMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return map[mime] ?? "bin";
}

/** Supabase Storage RLS expects first folder = auth.uid(). */
export function buildSupabaseStoragePath(userId: string, mime: string): string {
  return `${userId}/${randomUUID()}.${extForMime(mime)}`;
}

/** R2 object key (bucket name is NOT a key prefix). Never email/PII. */
export function buildR2ObjectKey(input: {
  purpose: MediaPurpose;
  userId: string;
  mime: string;
  pairId?: string | null;
  placeId?: string | null;
  serviceId?: string | null;
}): string {
  const id = randomUUID();
  const ext = extForMime(input.mime);
  const isVideo = input.mime.startsWith("video/");

  switch (input.purpose) {
    case "avatar":
      return `users/${input.userId}/avatar/${id}.${ext}`;
    case "chat":
      return isVideo
        ? `users/${input.userId}/videos/${id}.${ext}`
        : `users/${input.userId}/photos/${id}.${ext}`;
    case "couple":
      if (input.pairId) {
        return isVideo
          ? `couples/${input.pairId}/videos/${id}.${ext}`
          : `couples/${input.pairId}/photos/${id}.${ext}`;
      }
      return `temp/${id}/${id}.${ext}`;
    case "place_review":
      return `places/${input.placeId ?? "unknown"}/reviews/${id}.${ext}`;
    case "service":
      return `services/${input.serviceId ?? "unknown"}/media/${id}.${ext}`;
    case "banner":
      return `system/banners/${id}.${ext}`;
    case "profile":
    default:
      return isVideo
        ? `users/${input.userId}/videos/${id}.${ext}`
        : `users/${input.userId}/photos/${id}.${ext}`;
  }
}

export function derivePurpose(input: {
  pairId?: string | null;
  conversationId?: string | null;
  purpose?: string | null;
}): MediaPurpose {
  if (input.purpose === "avatar") return "avatar";
  if (input.conversationId) return "chat";
  if (input.pairId) return "couple";
  if (
    input.purpose &&
    ["profile", "place_review", "service", "banner"].includes(input.purpose)
  ) {
    return input.purpose as MediaPurpose;
  }
  return "profile";
}
