"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim() || null,
      fuzzy_region: String(formData.get("fuzzy_region") ?? "").trim() || null,
      job_title: String(formData.get("job_title") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  redirect("/me");
}
