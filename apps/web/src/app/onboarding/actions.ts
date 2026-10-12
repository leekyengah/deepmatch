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

  const fuzzy_region = String(formData.get("fuzzy_region") ?? "").trim();
  const discovery_opt_in = formData.get("discovery_opt_in") === "on";

  const patch: Record<string, unknown> = { mode };
  if (mode === "solo") {
    patch.discovery_opt_in = discovery_opt_in;
    if (fuzzy_region) patch.fuzzy_region = fuzzy_region;
  }

  await supabase.from("profiles").update(patch).eq("id", user.id);

  if (mode === "has_partner") redirect("/couple/invite");
  if (discovery_opt_in) redirect("/discover");
  redirect("/me");
}
