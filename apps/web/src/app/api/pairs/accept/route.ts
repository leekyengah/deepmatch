import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const body = (await req.json()) as { code?: string };
  const code = body.code?.trim();
  if (!code) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const { data: pairId, error } = await supabase.rpc("accept_pair_invite", {
    p_code_hash: hashCode(code),
  });

  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  return NextResponse.json({ pairId, mutualCreatesPair: false });
}
