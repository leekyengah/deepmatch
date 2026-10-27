"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { takeToken } from "@/lib/rate-limit";
import { getServerTranslator } from "@/lib/i18n/server";
import { isEmailVerified } from "@/lib/auth/email-verified";

function verifyUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/auth/verify-email?${q.toString()}`;
}

export async function resendVerificationAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emailFromForm = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = (user?.email ?? emailFromForm).trim().toLowerCase();
  if (!email) {
    redirect(verifyUrl({ error: t("auth.verifyMissingEmail") }));
  }

  if (user && isEmailVerified(user)) {
    redirect("/onboarding");
  }

  const rl = takeToken(`verify-resend:${email}`, 3, 15 * 60_000);
  if (!rl.ok) {
    redirect(
      verifyUrl({
        error: t("auth.verifyRateLimited", { sec: rl.retryAfterSec }),
      }),
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://datingvn.com";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate") || msg.includes("limit")) {
      redirect(verifyUrl({ error: t("auth.verifyRateLimited", { sec: 60 }) }));
    }
    redirect(verifyUrl({ error: t("auth.verifyResendFailed") }));
  }

  redirect(verifyUrl({ sent: "1" }));
}
