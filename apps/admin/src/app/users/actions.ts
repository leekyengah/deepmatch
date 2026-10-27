"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setUserSuspendedAction(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const suspended = String(formData.get("suspended") ?? "") === "true";
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!userId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_set_user_suspended", {
    p_user_id: userId,
    p_suspended: suspended,
    p_reason: reason,
  });
  if (error) {
    console.error("staff_set_user_suspended", error.message);
  }
  revalidatePath("/users");
}
