"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveModeAction(formData: FormData) {
  const mode = String(formData.get("mode") ?? "solo");
  if (mode !== "solo" && mode !== "has_partner") {
    redirect("/onboarding");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ mode }).eq("id", user.id);

  if (mode === "has_partner") redirect("/couple");
  redirect("/me");
}
