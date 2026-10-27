import { NextResponse, type NextRequest } from "next/server";
import { redactedInput, resolveAiAdapter, type AiTask } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError } from "@/lib/api-error";
import { runAssist } from "@/lib/ai/run-assist";

const TASKS = new Set<AiTask>([
  "profile_coach",
  "match_hints",
  "style",
  "beauty",
  "gift",
  "date_plan",
  "travel",
  "story",
  "safety_tips",
  "deepmind",
]);

export async function POST(req: NextRequest) {
  if (!(await flagEnabled("ff_ai"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagAiOff");
  }

  // EXT-041 circuit breaker — hard off without deleting code
  if (
    process.env.AI_DISABLED === "true" ||
    process.env.AI_ADAPTER === "off"
  ) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "aiCircuitOpen");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  let body: { task?: string; input?: Record<string, unknown>; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "invalidJson");
  }

  const task = body.task as AiTask;
  if (!TASKS.has(task)) {
    return jsonError("VALIDATION_ERROR", "aiUnknownTask");
  }
  if (!body.consent) {
    return jsonError("FORBIDDEN", "aiConsentRequired");
  }

  // Honor prior revoke: do not silently re-grant via assist checkbox alone.
  const { data: prior } = await supabase
    .from("ai_consents")
    .select("granted, revoked_at")
    .eq("user_id", user.id)
    .eq("purpose", task)
    .maybeSingle();
  if (prior?.revoked_at) {
    return jsonError("FORBIDDEN", "aiConsentRevoked");
  }

  const quota = Number(process.env.AI_DAILY_QUOTA ?? "40") || 40;
  const { data: usedToday } = await supabase.rpc("ai_usage_count_today", {
    p_user: user.id,
  });
  if (typeof usedToday === "number" && usedToday >= quota) {
    return jsonError(
      "RATE_LIMITED",
      "aiQuotaExceeded",
      undefined,
      { quota },
    );
  }

  if (!prior?.granted) {
    await supabase.from("ai_consents").upsert({
      user_id: user.id,
      purpose: task,
      granted: true,
      granted_at: new Date().toISOString(),
      revoked_at: null,
    });
  }

  const safe = redactedInput(body.input);
  const configured = resolveAiAdapter();
  const result = await runAssist(task, safe);

  await supabase.from("ai_usage_events").insert({
    user_id: user.id,
    task,
    adapter: result.adapter,
    tokens_in: JSON.stringify(safe).length,
    tokens_out: JSON.stringify(result.suggestions).length,
    ok: true,
    metadata: {
      configured,
      fallbackFrom: result.fallbackFrom ?? null,
    },
  });

  return NextResponse.json({ ok: true, ...result });
}
