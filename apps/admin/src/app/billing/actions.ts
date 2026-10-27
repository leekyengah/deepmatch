"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function confirmBankPaymentAction(formData: FormData) {
  const paymentId = String(formData.get("payment_id") ?? "");
  if (!paymentId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_confirm_bank_payment", {
    p_payment_id: paymentId,
    p_note: "confirmed from admin /billing",
  });
  if (error) {
    console.error("staff_confirm_bank_payment", error.message);
  }
  revalidatePath("/billing");
}
