import { NextResponse, type NextRequest } from "next/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { jsonError, makeRequestId } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = new Set<string>(ANALYTICS_EVENTS);
const PROP_KEY = /^[a-z_]{1,32}$/;
const PROP_VAL = /^[\w.\-]{0,64}$/;

/** EXT-036 — privacy-safe event sink (no-op when ANALYTICS_SINK=off). */
export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  let body: { event?: string; props?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const event = body.event?.trim() ?? "";
  if (!ALLOWED.has(event)) {
    return jsonError("VALIDATION_ERROR", "invalidAnalyticsEvent", requestId);
  }

  const safeProps: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(body.props ?? {})) {
    if (!PROP_KEY.test(k)) continue;
    if (typeof v === "boolean" || typeof v === "number") {
      safeProps[k] = v;
    } else if (typeof v === "string" && PROP_VAL.test(v)) {
      safeProps[k] = v;
    }
  }

  if (process.env.ANALYTICS_SINK === "off" || !process.env.ANALYTICS_SINK) {
    return NextResponse.json({
      ok: true,
      sunk: false,
      meta: { request_id: requestId },
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optional table — ignore failure so product never blocks on analytics.
  await supabase.from("analytics_events").insert({
    event,
    props: safeProps,
    user_id: user?.id ?? null,
  });

  return NextResponse.json({
    ok: true,
    sunk: true,
    meta: { request_id: requestId },
  });
}
