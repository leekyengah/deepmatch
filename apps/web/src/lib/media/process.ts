import sharp from "sharp";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_EDGE,
  THUMB_EDGE,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_SECONDS,
  type StorageBackend,
} from "./limits";
import { sniffMime, mimeMatchesClaim } from "./magic";
import { readVideoDurationSeconds } from "./video-duration";
import { deleteObject, getObjectBytes, putObjectBytes } from "./storage";

export type ProcessResult = {
  ok: boolean;
  error?: string;
  mime_type?: string;
  size_bytes?: number;
  width?: number | null;
  height?: number | null;
  duration_seconds?: number | null;
  storage_path?: string;
  thumb_path?: string | null;
};

function thumbKey(path: string): string {
  const i = path.lastIndexOf(".");
  if (i <= 0) return `${path}.thumb.webp`;
  return `${path.slice(0, i)}.thumb.webp`;
}

export async function verifyAndProcessMedia(input: {
  storagePath: string;
  backend: StorageBackend;
  claimedMime: string;
  claimedBytes: number;
}): Promise<ProcessResult> {
  const isVideoClaim = input.claimedMime.startsWith("video/");
  let bytes: Uint8Array;
  try {
    bytes = await getObjectBytes(
      input.storagePath,
      input.backend,
      isVideoClaim ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES,
    );
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "download_failed",
    };
  }

  if (bytes.byteLength <= 0) return { ok: false, error: "empty_object" };

  if (
    input.claimedBytes > 0 &&
    Math.abs(bytes.byteLength - input.claimedBytes) > 2048 &&
    bytes.byteLength > input.claimedBytes * 1.05
  ) {
    return { ok: false, error: "size_mismatch" };
  }

  const sniffed = sniffMime(bytes);
  if (!mimeMatchesClaim(sniffed, input.claimedMime)) {
    return { ok: false, error: "mime_mismatch" };
  }

  if (isVideoClaim) {
    const duration = readVideoDurationSeconds(input.claimedMime, bytes);
    if (duration == null) return { ok: false, error: "duration_unreadable" };
    if (duration > VIDEO_MAX_SECONDS + 0.05) {
      try {
        await deleteObject(input.storagePath, input.backend);
      } catch {
        /* orphan GC later */
      }
      return { ok: false, error: "video_too_long", duration_seconds: duration };
    }
    return {
      ok: true,
      mime_type: input.claimedMime,
      size_bytes: bytes.byteLength,
      width: null,
      height: null,
      duration_seconds: duration,
      storage_path: input.storagePath,
      thumb_path: null,
    };
  }

  try {
    const pipeline = sharp(Buffer.from(bytes), { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    const resized = pipeline.resize({
      width: IMAGE_MAX_EDGE,
      height: IMAGE_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
    const webp = await resized.webp({ quality: 82 }).toBuffer();
    const webpMeta = await sharp(webp).metadata();

    const finalPath = input.storagePath.replace(/\.[^.]+$/, ".webp");
    await putObjectBytes({
      storagePath: finalPath,
      backend: input.backend,
      bytes: new Uint8Array(webp),
      contentType: "image/webp",
    });

    const thumbBuf = await sharp(webp)
      .resize({
        width: THUMB_EDGE,
        height: THUMB_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();
    const tPath = thumbKey(finalPath);
    await putObjectBytes({
      storagePath: tPath,
      backend: input.backend,
      bytes: new Uint8Array(thumbBuf),
      contentType: "image/webp",
    });

    if (finalPath !== input.storagePath) {
      try {
        await deleteObject(input.storagePath, input.backend);
      } catch {
        /* keep original if delete fails */
      }
    }

    return {
      ok: true,
      mime_type: "image/webp",
      size_bytes: webp.byteLength,
      width: webpMeta.width ?? meta.width ?? null,
      height: webpMeta.height ?? meta.height ?? null,
      duration_seconds: null,
      storage_path: finalPath,
      thumb_path: tPath,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "image_process_failed",
    };
  }
}
