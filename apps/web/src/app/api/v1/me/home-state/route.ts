import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api-error";
import { resolveHomeState } from "@/lib/home-state";

/** EXT-051 — allowlisted home state for authenticated clients. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED");

  const result = await resolveHomeState(user.id);
  return NextResponse.json({
    ok: true,
    state: result.state,
    redirectTo: result.redirectTo,
    hasMutualMatch: result.hasMutualMatch,
    coupleActive: Boolean(result.coupleId),
  });
}
