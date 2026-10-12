import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { jsonError } from "@/lib/api-error";
import { resolveAiAdapter } from "@deepmatch/shared";

/** EXT-041 — daily AI usage + circuit status (allowlisted). */
export async function GET() {
  if (!(await flagEnabled("ff_ai"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagAiOff");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  const quota = Number(process.env.AI_DAILY_QUOTA ?? "40") || 40;
  const disabled =
    process.env.AI_DISABLED === "true" ||
    process.env.AI_ADAPTER === "off";

  const { data: usedToday } = await supabase.rpc("ai_usage_count_today", {
    p_user: user.id,
  });
  const used = typeof usedToday === "number" ? usedToday : 0;

  return NextResponse.json({
    ok: true,
    used,
    quota,
    remaining: Math.max(0, quota - used),
    circuitOpen: disabled,
    adapter: disabled ? "off" : resolveAiAdapter(),
  });
}
