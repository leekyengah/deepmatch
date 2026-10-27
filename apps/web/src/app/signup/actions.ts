"use server";

import { redirect } from "next/navigation";
import { isAgeEligible } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_CONSENT_KEYS } from "@deepmatch/legal-content";
import { getServerTranslator } from "@/lib/i18n/server";
import { safeNextPath } from "@/lib/safe-next";

function signupErrorUrl(message: string, next: string) {
  const q = new URLSearchParams({ error: message });
  if (next !== "/onboarding" && next !== "/me") q.set("next", next);
  return `/signup?${q.toString()}`;
}

export async function signupAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "");
  const ageConfirm = formData.get("age_confirm");
  const acceptTerms = formData.get("accept_terms");
  const ackPrivacy = formData.get("ack_privacy");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/onboarding");

  if (!ageConfirm || !acceptTerms || !ackPrivacy) {
    redirect(signupErrorUrl(t("auth.needAgeTos"), next));
  }
  if (!isAgeEligible(birthDate, Number(process.env.MIN_AGE ?? 18))) {
    redirect(signupErrorUrl(t("auth.ageGate"), next));
  }
  if (password.length < 8) {
    redirect(signupErrorUrl(t("auth.passwordMinError"), next));
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://datingvn.com";
  const emailRedirectTo = next.startsWith("/couple/join")
    ? `${origin}${next}`
    : `${origin}/auth/callback?next=/onboarding`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        birth_date: birthDate,
        mode: next.startsWith("/couple/join") ? "has_partner" : "solo",
      },
      emailRedirectTo,
    },
  });

  if (error) {
    redirect(signupErrorUrl(t("auth.signupFailed"), next));
  }

  const userId = data.user?.id;
  if (userId) {
    await supabase.from("consent_events").insert([
      {
        user_id: userId,
        consent_key: LEGAL_CONSENT_KEYS.ageEligible,
        version: LEGAL_CONSENT_KEYS.version,
        granted: true,
      },
      {
        user_id: userId,
        consent_key: LEGAL_CONSENT_KEYS.termsAccept,
        version: LEGAL_CONSENT_KEYS.version,
        granted: true,
      },
      {
        user_id: userId,
        consent_key: LEGAL_CONSENT_KEYS.privacyNoticeAck,
        version: LEGAL_CONSENT_KEYS.version,
        granted: true,
      },
    ]);
  }

  // Couple invite: skip generic onboarding and accept immediately
  if (next.startsWith("/couple/join")) {
    redirect(next);
  }

  // When confirmation is required, session may exist but email_confirmed_at is null.
  const confirmed = Boolean(data.user?.email_confirmed_at);
  if (!confirmed) {
    redirect("/auth/verify-email");
  }
  redirect("/onboarding");
}
