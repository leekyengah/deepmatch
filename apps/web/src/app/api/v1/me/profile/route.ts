import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, bio, avatar_path, birth_date, fuzzy_region, job_title, mode, discovery_opt_in, hidden_from_discovery",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (error || !profile) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "profileNotFound", requestId);
  }

  const { data: deep } = await supabase
    .from("profile_deep")
    .select("goals, values, interests, communication_style, expectations, dealbreakers, field_visibility")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    data: { profile, deep: deep ?? null },
    meta: { request_id: requestId },
  });
}

export async function PATCH(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    display_name?: string;
    bio?: string;
    fuzzy_region?: string;
    job_title?: string;
    discovery_opt_in?: boolean;
    hidden_from_discovery?: boolean;
    deep?: {
      goals?: string[];
      values?: string[];
      interests?: string[];
      communication_style?: string;
      expectations?: string;
      dealbreakers?: string[];
    };
  };

  const profilePatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const key of [
    "display_name",
    "bio",
    "fuzzy_region",
    "job_title",
    "discovery_opt_in",
    "hidden_from_discovery",
  ] as const) {
    if (body[key] !== undefined) profilePatch[key] = body[key];
  }

  const { error: pErr } = await supabase
    .from("profiles")
    .update(profilePatch)
    .eq("id", user.id);
  if (pErr) return jsonError("VALIDATION_ERROR", pErr.message, requestId);

  if (body.deep) {
    const { error: dErr } = await supabase.from("profile_deep").upsert({
      user_id: user.id,
      ...body.deep,
    });
    if (dErr) return jsonError("VALIDATION_ERROR", dErr.message, requestId);
  }

  return NextResponse.json({
    data: { ok: true },
    meta: { request_id: requestId },
  });
}
