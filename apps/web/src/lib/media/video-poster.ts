import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { THUMB_EDGE } from "./limits";

/**
 * Extract a poster frame with FFmpeg (ffmpeg-static) then compress to WebP.
 * Returns null when FFmpeg is unavailable — caller may still mark READY.
 */
export async function extractVideoPosterWebp(
  videoBytes: Uint8Array,
  seekSeconds = 1,
): Promise<Uint8Array | null> {
  let dir: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath = require("ffmpeg-static") as string | null;
    if (!ffmpegPath) return null;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpeg = require("fluent-ffmpeg") as typeof import("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(ffmpegPath);

    dir = await mkdtemp(join(tmpdir(), "dm-poster-"));
    const inPath = join(dir, "in.bin");
    const outPath = join(dir, "frame.jpg");
    await writeFile(inPath, videoBytes);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inPath)
        .seekInput(Math.max(0, seekSeconds))
        .frames(1)
        .outputOptions(["-q:v", "3"])
        .output(outPath)
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    const jpeg = await readFile(outPath);
    const webp = await sharp(jpeg)
      .rotate()
      .resize({
        width: THUMB_EDGE * 2,
        height: THUMB_EDGE * 2,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 78 })
      .toBuffer();
    return new Uint8Array(webp);
  } catch {
    return null;
  } finally {
    if (dir) {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
