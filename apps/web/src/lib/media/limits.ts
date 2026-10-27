export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const VIDEO_MAX_SECONDS = 30;
export const IMAGE_MAX_EDGE = 2048;
export const THUMB_EDGE = 320;
export const PROFILE_MAX_IMAGES = 10;
export const PROFILE_MAX_VIDEOS = 2;

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

export const PRESIGN_PUT_TTL_SECONDS = 120;
export const PRESIGN_GET_TTL_SECONDS = 300;

export type MediaVisibility =
  | "public"
  | "private"
  | "couple_private"
  | "admin_restricted";

export type ProcessingStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export type StorageBackend = "supabase" | "r2";

export function getStorageBackend(): StorageBackend {
  const raw = (process.env.STORAGE_BACKEND ?? "supabase")
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .trim();
  return raw === "r2" ? "r2" : "supabase";
}
