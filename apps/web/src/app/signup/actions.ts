"use server";

import { redirect } from "next/navigation";
import { isAgeEligible } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
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
  const tos = formData.get("tos");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/onboarding");

  if (!ageConfirm || !tos) {
    redirect(signupErrorUrl(t("auth.needAgeTos"), next));
  }
  if (!isAgeEligible(birthDate, Number(process.env.MIN_AGE ?? 18))) {
    redirect(signupErrorUrl(t("auth.ageGate"), next));
  }
  if (password.length < 8) {
    redirect(signupErrorUrl(t("auth.passwordMinError"), next));
  }

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
      emailRedirectTo: next.startsWith("/couple/join")
        ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://datingvn.com"}${next}`
        : undefined,
    },
  });

  if (error) {
    redirect(signupErrorUrl(error.message, next));
  }

  const userId = data.user?.id;
  if (userId) {
    await supabase.from("consent_events").insert([
      {
        user_id: userId,
        consent_key: "age_eligible",
        version: "v1",
        granted: true,
      },
      {
        user_id: userId,
        consent_key: "tos_privacy",
        version: "v1",
        granted: true,
      },
    ]);
  }

  // Couple invite: skip generic onboarding and accept immediately
  if (next.startsWith("/couple/join")) {
    redirect(next);
  }
  redirect("/onboarding");
}
