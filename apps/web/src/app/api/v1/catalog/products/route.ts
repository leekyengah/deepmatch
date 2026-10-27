import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { apiT, jsonError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  if (!(await flagEnabled("ff_lifestyle"))) {
    return jsonError("RESOURCE_NOT_ACCESSIBLE", "flagLifestyleOff");
  }
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category");
  const q = sp.get("q")?.trim();
  const limit = Math.min(Number(sp.get("limit") ?? 24) || 24, 60);
  const offset = Math.max(Number(sp.get("offset") ?? 0) || 0, 0);

  const supabase = await createClient();
  let query = supabase
    .from("commerce_products")
    .select(
      "id, mock_id, category, title, kind, description, price_vnd, unit, fulfillment, demo_banner, provider_id, commerce_providers(display_name, status)",
      { count: "exact" },
    )
    .eq("active", true)
    .order("price_vnd", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error, count } = await query;
  if (error) return jsonError("INTERNAL");

  return NextResponse.json({
    ok: true,
    demo: true,
    banner: await apiT("demoBanner"),
    total: count ?? 0,
    offset,
    limit,
    products: (data ?? []).map((p) => {
      const prov = p.commerce_providers as {
        display_name?: string;
        status?: string;
      } | null;
      return {
        id: p.id,
        mock_id: p.mock_id,
        category: p.category,
        title: p.title,
        kind: p.kind,
        description: p.description,
        price_vnd: p.price_vnd,
        unit: p.unit,
        fulfillment: p.fulfillment,
        demo_banner: p.demo_banner,
        provider_status: prov?.status ?? "DEMO",
        provider_name: prov?.display_name ?? "DEMO",
      };
    }),
  });
}
