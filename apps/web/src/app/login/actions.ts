"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OWNER_EMAILS = new Set(
  (process.env.ADMIN_OWNER_EMAILS ?? "leekyengah@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

const ADMIN_APP_URL = (
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://deepmatch-admin.vercel.app"
).replace(/\/$/, "");

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const user = data.user;
  const emailKey = user?.email?.trim().toLowerCase() ?? "";
  let staff = OWNER_EMAILS.has(emailKey);
  if (!staff && user) {
    const { data: roleRow } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    staff =
      roleRow?.role === "owner" || roleRow?.role === "admin";
  }

  if (staff) {
    redirect(`${ADMIN_APP_URL}/`);
  }
  redirect("/me");
}
