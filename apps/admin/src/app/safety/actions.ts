"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateReportStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "open"
    | "triaged"
    | "resolved"
    | "appealed";
  if (!id || !["open", "triaged", "resolved", "appealed"].includes(status)) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("reports").update({ status }).eq("id", id);
  revalidatePath("/safety");
  revalidatePath("/moderation");
}

export async function suspendTargetAction(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const reportId = String(formData.get("report_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!userId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_set_user_suspended", {
    p_user_id: userId,
    p_suspended: true,
    p_reason: reason || "Suspended from report triage",
  });
  if (error) {
    console.error("suspend failed", error.message);
    return;
  }
  if (reportId) {
    await supabase.from("reports").update({ status: "triaged" }).eq("id", reportId);
  }
  revalidatePath("/safety");
  revalidatePath("/moderation");
}
