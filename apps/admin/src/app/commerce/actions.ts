"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function staffBookingTransitionAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!bookingId || !action) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_transition_booking", {
    p_booking_id: bookingId,
    p_action: action,
    p_request_id: `admin:${Date.now()}`,
  });
  if (error) {
    console.error("booking transition failed", error.message);
    return;
  }
  revalidatePath("/commerce");
  revalidatePath("/services");
}

export async function staffOrderTransitionAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!orderId || !action) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("staff_transition_order", {
    p_order_id: orderId,
    p_action: action,
    p_request_id: `admin:${Date.now()}`,
  });
  if (error) {
    console.error("order transition failed", error.message);
    return;
  }
  revalidatePath("/commerce");
}
