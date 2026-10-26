# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def merge(ns: str, vi: dict, en: dict) -> None:
    vip = ROOT / f"packages/i18n/locales/vi-VN/{ns}.json"
    enp = ROOT / f"packages/i18n/locales/en-US/{ns}.json"
    vo = json.loads(vip.read_text(encoding="utf-8"))
    eo = json.loads(enp.read_text(encoding="utf-8"))
    vo.update(vi)
    eo.update(en)
    vip.write_text(json.dumps(vo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    enp.write_text(json.dumps(eo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


merge(
    "auth",
    {
        "missingEmail": "Thiếu email.",
        "needAgeTos": "Cần xác nhận tuổi và điều khoản",
        "passwordMismatch": "Hai mật khẩu không khớp.",
        "resetSessionExpired": "Phiên đặt lại hết hạn. Yêu cầu lại.",
        "deletedDisplayName": "Đã xóa",
    },
    {
        "missingEmail": "Email is required.",
        "needAgeTos": "Confirm age and terms to continue",
        "passwordMismatch": "Passwords do not match.",
        "resetSessionExpired": "Reset session expired. Request a new link.",
        "deletedDisplayName": "Deleted",
    },
)

# forgot-password
(ROOT / "apps/web/src/app/forgot-password/actions.ts").write_text(
    '''"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export async function forgotPasswordAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/forgot-password?error=" + encodeURIComponent(t("auth.missingEmail")));
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\\/$/, "") ||
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset`,
  });

  if (error) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/forgot-password?sent=1");
}
''',
    encoding="utf-8",
)

(ROOT / "apps/web/src/app/signup/actions.ts").write_text(
    '''"use server";

import { redirect } from "next/navigation";
import { isAgeEligible } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export async function signupAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "");
  const ageConfirm = formData.get("age_confirm");
  const tos = formData.get("tos");

  if (!ageConfirm || !tos) {
    redirect(`/signup?error=${encodeURIComponent(t("auth.needAgeTos"))}`);
  }
  if (!isAgeEligible(birthDate, Number(process.env.MIN_AGE ?? 18))) {
    redirect(`/signup?error=${encodeURIComponent(t("auth.ageGate"))}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent(t("auth.passwordMinError"))}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        birth_date: birthDate,
        mode: "solo",
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
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

  redirect("/onboarding");
}
''',
    encoding="utf-8",
)

(ROOT / "apps/web/src/app/auth/reset/actions.ts").write_text(
    '''"use server";

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
    redirect(`/auth/reset?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/me?password_updated=1");
}
''',
    encoding="utf-8",
)

# account-deletion — only anonymized display_name
p = ROOT / "apps/web/src/app/account-deletion/actions.ts"
t = p.read_text(encoding="utf-8")
if "getServerTranslator" not in t:
    t = t.replace(
        'import { createServiceClient } from "@/lib/supabase/route";\n',
        'import { createServiceClient } from "@/lib/supabase/route";\nimport { getServerTranslator } from "@/lib/i18n/server";\n',
    )
    t = t.replace(
        "export async function deleteAccountAction(formData: FormData) {\n",
        "export async function deleteAccountAction(formData: FormData) {\n  const { t } = await getServerTranslator();\n",
    )
t = t.replace('display_name: "Đã xóa"', 'display_name: t("auth.deletedDisplayName")')
p.write_text(t, encoding="utf-8")
print("actions done")
