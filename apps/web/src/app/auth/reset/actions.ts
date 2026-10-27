"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export async function resetPasswordAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    redirect(
      `/auth/reset?error=${encodeURIComponent(t("auth.passwordMinError"))}`,
    );
  }
  if (password !== confirm) {
    redirect(
      `/auth/reset?error=${encodeURIComponent(t("auth.passwordMismatch"))}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(t("auth.resetSessionExpired"))}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(
      `/auth/reset?error=${encodeURIComponent(t("auth.resetFailed"))}`,
    );
  }

  redirect("/me?password_updated=1");
}
