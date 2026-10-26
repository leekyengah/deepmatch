"use server";

import { redirect } from "next/navigation";
import { normalizeIntent } from "@deepmatch/shared";
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

  const fuzzy_region = String(formData.get("fuzzy_region") ?? "").trim();
  const discovery_opt_in = formData.get("discovery_opt_in") === "on";
  const values = formData
    .getAll("values")
    .map((v) => String(v))
    .filter(Boolean);
  const canonical =
    normalizeIntent(String(formData.get("intent") ?? "dating")) ?? "dating";

  const patch: Record<string, unknown> = { mode };
  if (mode === "solo") {
    patch.discovery_opt_in = discovery_opt_in;
    if (fuzzy_region) patch.fuzzy_region = fuzzy_region;
  }

  await supabase.from("profiles").update(patch).eq("id", user.id);

  if (values.length || canonical) {
    await supabase.from("profile_deep").upsert({
      user_id: user.id,
      values: values.length ? values : [],
      goals: [canonical],
    });
  }

  // QX-01: continue to 7-question needs onboarding (skip-able).
  redirect("/onboarding/needs");
}
