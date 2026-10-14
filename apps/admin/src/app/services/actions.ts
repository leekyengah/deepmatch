"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assignBookingAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const advisorId = String(formData.get("advisor_id") ?? "");
  if (!bookingId || !advisorId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_assign_booking", {
    p_booking_id: bookingId,
    p_advisor_id: advisorId,
  });
  if (error) {
    console.error("assign failed", error.message);
    return;
  }
  revalidatePath("/services");
}
