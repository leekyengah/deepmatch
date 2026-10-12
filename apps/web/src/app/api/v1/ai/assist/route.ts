import { NextResponse, type NextRequest } from "next/server";
import {
  redactedInput,
  stubAssist,
  type AiTask,
} from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError } from "@/lib/api-error";

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
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "AI assist is off");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in required");

  let body: { task?: string; input?: Record<string, unknown>; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON");
  }

  const task = body.task as AiTask;
  if (!TASKS.has(task)) {
    return jsonError("VALIDATION_ERROR", "Unknown AI task");
  }
  if (!body.consent) {
    return jsonError(
      "FORBIDDEN",
      "Explicit consent required for this AI purpose",
    );
  }

  await supabase.from("ai_consents").upsert({
    user_id: user.id,
    purpose: task,
    granted: true,
    granted_at: new Date().toISOString(),
    revoked_at: null,
  });

  const safe = redactedInput(body.input);
  const result = stubAssist(task, safe);

  await supabase.from("ai_usage_events").insert({
    user_id: user.id,
    task,
    adapter: "stub",
    tokens_in: JSON.stringify(safe).length,
    tokens_out: JSON.stringify(result.suggestions).length,
    ok: true,
    metadata: { path: "stubAssist" },
  });

  return NextResponse.json({ ok: true, ...result });
}
