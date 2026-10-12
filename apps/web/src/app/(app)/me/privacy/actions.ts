"use server";

import { revalidatePath } from "next/cache";
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

/** EXT-042 — revoke all AI purpose consents immediately. */
export async function revokeAiConsentsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();
  await supabase
    .from("ai_consents")
    .update({ granted: false, revoked_at: now })
    .eq("user_id", user.id)
    .eq("granted", true);

  await supabase.from("consent_events").insert({
    user_id: user.id,
    consent_key: "ai_all_purposes",
    version: "1",
    granted: false,
  });

  revalidatePath("/me/privacy");
  redirect("/me/privacy?ai=revoked");
}
