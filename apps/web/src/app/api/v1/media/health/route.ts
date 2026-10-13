import { NextResponse } from "next/server";
import { makeRequestId } from "@/lib/api-error";
import { getStorageBackend } from "@/lib/media/limits";
import { ensureR2Cors, pingR2 } from "@/lib/media/storage";

export async function GET() {
  const requestId = makeRequestId();
  const backend = getStorageBackend();
  if (backend !== "r2") {
    return NextResponse.json({
      data: { backend, r2: null },
      meta: { request_id: requestId },
    });
  }

  const ping = await pingR2();
  if (ping.ok) {
    const origins = [
      process.env.NEXT_PUBLIC_APP_URL,
      "https://datingvn.com",
      "https://www.datingvn.com",
      "http://localhost:3000",
    ].filter((x): x is string => Boolean(x));
    try {
      await ensureR2Cors(origins);
    } catch {
      /* best-effort */
    }
  }

  return NextResponse.json({
    data: {
      backend,
      r2: { ok: ping.ok, error: ping.error ?? null },
    },
    meta: { request_id: requestId },
  });
}
