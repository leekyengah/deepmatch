import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json()) as { code?: string };
  const code = body.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }

  const { data: pairId, error } = await supabase.rpc("accept_pair_invite", {
    p_code_hash: hashCode(code),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pairId, mutualCreatesPair: false });
}
