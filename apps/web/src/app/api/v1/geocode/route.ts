import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError, makeRequestId } from "@/lib/api-error";

/** Server-side Nominatim proxy (User-Agent required by OSM policy). */
export async function GET(req: Request) {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return jsonError("VALIDATION_ERROR", "missingPlaceQuery", requestId);
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "DeepMatch/1.0 (couple-map; https://datingvn.com)",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    return jsonError("VALIDATION_ERROR", "geocodeUpstream", requestId);
  }
  const rows = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name?: string;
  }>;
  const hit = rows[0];
  if (!hit) {
    return NextResponse.json({
      data: { result: null },
      meta: { request_id: requestId },
    });
  }
  return NextResponse.json({
    data: {
      result: {
        lat: Number(hit.lat),
        lng: Number(hit.lon),
        label: hit.display_name ?? q,
      },
    },
    meta: { request_id: requestId },
  });
}
