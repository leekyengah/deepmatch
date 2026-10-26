import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/me";
  const next = nextRaw.startsWith("/") ? nextRaw : "/me";
  const errorDescription =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error") ??
    "";

  if (errorDescription) {
    const lower = errorDescription.toLowerCase();
    const reason =
      lower.includes("expir") || lower.includes("otp")
        ? "expired"
        : "invalid";
    return NextResponse.redirect(
      new URL(`/auth/verify-email?reason=${reason}`, url.origin),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const lower = error.message.toLowerCase();
      const reason =
        lower.includes("expir") || lower.includes("otp")
          ? "expired"
          : "invalid";
      return NextResponse.redirect(
        new URL(`/auth/verify-email?reason=${reason}`, url.origin),
      );
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
