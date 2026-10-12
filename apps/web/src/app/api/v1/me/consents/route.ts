import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const body = (await req.json()) as {
    consent_key?: string;
    version?: string;
    granted?: boolean;
  };
  if (!body.consent_key?.trim() || !body.version?.trim()) {
    return jsonError("VALIDATION_ERROR", "missingConsent", requestId);
  }

  const { data, error } = await supabase
    .from("consent_events")
    .insert({
      user_id: user.id,
      consent_key: body.consent_key.trim(),
      version: body.version.trim(),
      granted: body.granted !== false,
    })
    .select("id, consent_key, version, granted, created_at")
    .single();
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { consent: data },
    meta: { request_id: requestId },
  });
}

export async function GET() {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const { data, error } = await supabase
    .from("consent_events")
    .select("id, consent_key, version, granted, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return jsonError("VALIDATION_ERROR", null, requestId);

  return NextResponse.json({
    data: { consents: data ?? [] },
    meta: { request_id: requestId },
  });
}
