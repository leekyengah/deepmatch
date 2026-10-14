"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFlagAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("name", name);
  if (error) {
    console.error("flag toggle", error.message);
    return;
  }
  revalidatePath("/flags");
}
