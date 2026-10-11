"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function savePrivacyAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      discovery_opt_in: formData.get("discovery_opt_in") === "on",
      hidden_from_discovery: formData.get("hidden_from_discovery") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  redirect("/me/privacy");
}
