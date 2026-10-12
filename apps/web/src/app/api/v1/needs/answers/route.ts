import { NextResponse, type NextRequest } from "next/server";
import { NEEDS_QUESTION_BANK_VI } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { jsonError, makeRequestId } from "@/lib/api-error";

const ALLOWED = new Set(NEEDS_QUESTION_BANK_VI.map((q) => q.id));

export async function GET() {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data } = await supabase
    .from("needs_answers")
    .select("answers, consent_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const answers = (data?.answers ?? {}) as Record<string, string>;
  const answered = Object.keys(answers).filter((k) => ALLOWED.has(k)).length;

  return NextResponse.json({
    data: {
      answers,
      consent_at: data?.consent_at ?? null,
      updated_at: data?.updated_at ?? null,
      total: NEEDS_QUESTION_BANK_VI.length,
      answered,
    },
    meta: { request_id: requestId },
  });
}

export async function PUT(req: NextRequest) {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  let body: {
    answers?: Record<string, string>;
    consent?: boolean;
    merge?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }

  const { data: existing } = await supabase
    .from("needs_answers")
    .select("answers, consent_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasConsent = body.consent === true || Boolean(existing?.consent_at);
  if (!hasConsent) {
    return jsonError("VALIDATION_ERROR", "consentRequired", requestId);
  }

  const incoming: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.answers ?? {})) {
    if (!ALLOWED.has(k)) continue;
    if (typeof v !== "string") continue;
    const trimmed = v.trim().slice(0, 2000);
    if (trimmed) incoming[k] = trimmed;
  }

  const next = body.merge
    ? { ...((existing?.answers as Record<string, string>) ?? {}), ...incoming }
    : incoming;

  const { error } = await supabase.from("needs_answers").upsert({
    user_id: user.id,
    answers: next,
    consent_at: existing?.consent_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) return jsonError("INTERNAL", null, requestId);

  return NextResponse.json({
    data: {
      answers: next,
      answered: Object.keys(next).length,
      total: NEEDS_QUESTION_BANK_VI.length,
    },
    meta: { request_id: requestId },
  });
}

export async function DELETE() {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  await supabase.from("needs_answers").delete().eq("user_id", user.id);
  return NextResponse.json({
    data: { ok: true },
    meta: { request_id: requestId },
  });
}
