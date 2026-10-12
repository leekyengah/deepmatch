import { NextResponse, type NextRequest } from "next/server";
import { NEEDS_QUESTION_BANK_VI } from "@deepmatch/shared";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

const ALLOWED = new Set(NEEDS_QUESTION_BANK_VI.map((q) => q.id));
const PREF_IDS = new Set(["C05", "C06", "C01", "D01", "F01", "M01"]);

export type NeedsMatchPref = {
  desire: string;
  weight: number;
  hard: boolean;
};

function sanitizePrefs(
  raw: Record<string, unknown> | null | undefined,
): Record<string, NeedsMatchPref> {
  const out: Record<string, NeedsMatchPref> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, val] of Object.entries(raw)) {
    if (!ALLOWED.has(id) || !PREF_IDS.has(id)) continue;
    if (!val || typeof val !== "object") continue;
    const v = val as Record<string, unknown>;
    const desire = typeof v.desire === "string" ? v.desire.trim().slice(0, 200) : "";
    const weight = Math.min(3, Math.max(0, Number(v.weight) || 0));
    const hard = v.hard === true;
    if (!desire && !hard && weight === 0) continue;
    out[id] = { desire, weight, hard };
  }
  return out;
}

export async function GET(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const full = await supabase
    .from("needs_answers")
    .select("answers, match_prefs, consent_at")
    .eq("user_id", user.id)
    .maybeSingle();
  const data =
    full.data ??
    (
      await supabase
        .from("needs_answers")
        .select("answers, consent_at")
        .eq("user_id", user.id)
        .maybeSingle()
    ).data;

  return NextResponse.json({
    data: {
      self: (data?.answers ?? {}) as Record<string, string>,
      preferences: sanitizePrefs(
        (data as { match_prefs?: Record<string, unknown> } | null)?.match_prefs,
      ),
      consent_at: data?.consent_at ?? null,
      pref_ids: [...PREF_IDS],
    },
    meta: { request_id: requestId },
  });
}

export async function PUT(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: { preferences?: Record<string, unknown>; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const preferences = sanitizePrefs(body.preferences);
  const { data: existing } = await supabase
    .from("needs_answers")
    .select("answers, consent_at, match_prefs")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasConsent = body.consent === true || Boolean(existing?.consent_at);
  if (!hasConsent) {
    return jsonError("VALIDATION_ERROR", "consentRequired", requestId);
  }

  const { error } = await supabase.from("needs_answers").upsert({
    user_id: user.id,
    answers: (existing?.answers as Record<string, string>) ?? {},
    match_prefs: preferences,
    consent_at: existing?.consent_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: { preferences },
    meta: { request_id: requestId },
  });
}
