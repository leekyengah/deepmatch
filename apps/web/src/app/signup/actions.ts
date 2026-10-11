"use server";

import { redirect } from "next/navigation";
import { isAgeEligible } from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "");
  const ageConfirm = formData.get("age_confirm");
  const tos = formData.get("tos");

  if (!ageConfirm || !tos) {
    redirect(`/signup?error=${encodeURIComponent("Cần xác nhận tuổi và điều khoản")}`);
  }
  if (!isAgeEligible(birthDate, Number(process.env.MIN_AGE ?? 18))) {
    redirect(`/signup?error=${encodeURIComponent("Chỉ dành cho người từ 18 tuổi")}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Mật khẩu tối thiểu 8 ký tự")}`);
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
