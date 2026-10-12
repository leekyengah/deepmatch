import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getRouteUser } from "@/lib/supabase/route";
import { jsonError, makeRequestId } from "@/lib/api-error";
import {
  coupleJoinUrl,
  sendCoupleInviteEmail,
} from "@/lib/email/couple-invite";
import { getRequestLocale } from "@/lib/i18n/server";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

export async function POST(req: NextRequest) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  let body: { email?: string } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text) as { email?: string };
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON", requestId);
  }

  const emailRaw = body.email?.trim().toLowerCase() ?? "";
  if (emailRaw && !isEmail(emailRaw)) {
    return jsonError("VALIDATION_ERROR", "Invalid email", requestId);
  }
  if (emailRaw && user.email?.toLowerCase() === emailRaw) {
    return jsonError("VALIDATION_ERROR", "Cannot invite yourself", requestId);
  }

  const code = randomBytes(16).toString("base64url");
  const code_hash = hashCode(code);
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();

  const insertRow: {
    code_hash: string;
    created_by: string;
    expires_at: string;
    invitee_email?: string;
  } = {
    code_hash,
    created_by: user.id,
    expires_at,
  };
  if (emailRaw) insertRow.invitee_email = emailRaw;

  const { error } = await supabase.from("pair_invites").insert(insertRow);

  if (error) {
    // Column may be missing before migration — retry without email
    if (emailRaw && /invitee_email/i.test(error.message)) {
      const { error: e2 } = await supabase.from("pair_invites").insert({
        code_hash,
        created_by: user.id,
        expires_at,
      });
      if (e2) return jsonError("VALIDATION_ERROR", e2.message, requestId);
    } else {
      return jsonError("VALIDATION_ERROR", error.message, requestId);
    }
  }

  const inviteUrl = coupleJoinUrl(code);
  let delivery: "none" | "resend" | "stub" = "none";
  let emailOk: boolean | null = null;

  if (emailRaw) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    const inviterName =
      profile?.display_name?.trim() ||
      user.email?.split("@")[0] ||
      "DeepMatch";
    const locale = await getRequestLocale();
    const sent = await sendCoupleInviteEmail({
      to: emailRaw,
      inviteUrl,
      inviterName,
      locale,
    });
    delivery = sent.delivery;
    emailOk = sent.ok;
  }

  return NextResponse.json({
    code,
    expires_at,
    inviteUrl,
    email: emailRaw || null,
    emailDelivery: delivery,
    emailOk,
  });
}
