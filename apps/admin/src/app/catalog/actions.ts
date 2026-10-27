"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = new Set(["DEMO", "TEST", "VERIFIED"]);

export async function setProviderStatusAction(formData: FormData) {
  const id = String(formData.get("provider_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ALLOWED.has(status)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("commerce_providers")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("catalog status", error.message);
    return;
  }
  revalidatePath("/catalog");
}

export async function setProductActiveAction(formData: FormData) {
  const id = String(formData.get("product_id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("commerce_products")
    .update({ active })
    .eq("id", id);
  if (error) {
    console.error("catalog product", error.message);
    return;
  }
  revalidatePath("/catalog");
}
