import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError } from "@/lib/api-error";

export async function GET() {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commerce_categories")
    .select("slug, title_vi, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return jsonError("INTERNAL");
  return NextResponse.json({
    ok: true,
    demo: true,
    banner: await apiT("demoBanner"),
    categories: data ?? [],
  });
}
