import { NextResponse, type NextRequest } from "next/server";
import { DEEPMIND_QUESTIONS } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError } from "@/lib/api-error";

export async function GET() {
  if (!(await flagEnabled("ff_ai"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagAiOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  const { data } = await supabase
    .from("ai_deepmind_answers")
    .select("answers, insight_draft, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    questions: DEEPMIND_QUESTIONS,
    answers: data?.answers ?? {},
    insight_draft: data?.insight_draft ?? null,
    updated_at: data?.updated_at ?? null,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await flagEnabled("ff_ai"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagAiOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  let body: { answers?: Record<string, string>; insight_draft?: string | null };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson");
  }

  const allowed = new Set(DEEPMIND_QUESTIONS.map((q) => q.id));
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.answers ?? {})) {
    if (!allowed.has(k)) continue;
    if (typeof v !== "string") continue;
    answers[k] = v.slice(0, 200);
  }

  const { error } = await supabase.from("ai_deepmind_answers").upsert({
    user_id: user.id,
    answers,
    insight_draft:
      body.insight_draft === undefined
        ? undefined
        : body.insight_draft
          ? String(body.insight_draft).slice(0, 2000)
          : null,
    updated_at: new Date().toISOString(),
  });
  if (error) return jsonError("INTERNAL");

  await supabase.from("ai_consents").upsert({
    user_id: user.id,
    purpose: "deepmind",
    granted: true,
    granted_at: new Date().toISOString(),
    revoked_at: null,
  });

  return NextResponse.json({ ok: true, answers });
}

export async function DELETE() {
  if (!(await flagEnabled("ff_ai"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagAiOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  await supabase.from("ai_deepmind_answers").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
