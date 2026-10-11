import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const code = randomBytes(16).toString("base64url");
  const code_hash = hashCode(code);
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();

  const { error } = await supabase.from("pair_invites").insert({
    code_hash,
    created_by: user.id,
    expires_at,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Return plaintext code once; only hash is stored (anti-enumeration of DB).
  return NextResponse.json({ code, expires_at });
}
