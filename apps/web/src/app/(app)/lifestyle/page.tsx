import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { getServerTranslator } from "@/lib/i18n/server";
import { LifestyleMarketplace } from "@/components/lifestyle/LifestyleMarketplace";

export default async function LifestyleHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const { t } = await getServerTranslator();
  const { q } = await searchParams;
  const supabase = await createClient();

  const [{ data: products }, { data: providers }] = await Promise.all([
    supabase
      .from("commerce_products")
      .select(
        "mock_id, category, title, price_vnd, unit, commerce_providers(display_name)",
      )
      .eq("active", true)
      .gt("price_vnd", 0)
      .order("price_vnd", { ascending: false })
      .limit(24),
    supabase
      .from("commerce_providers")
      .select("display_name, status, source_note")
      .order("display_name", { ascending: true })
      .limit(8),
  ]);

  // One product per category first, then fill — avoids flooding with 0₫ safety seeds.
  type Row = NonNullable<typeof products>[number];
  const byCategory = new Map<string, Row>();
  const rest: Row[] = [];
  for (const p of products ?? []) {
    const cat = String(p.category);
    if (!byCategory.has(cat)) byCategory.set(cat, p);
    else rest.push(p);
  }
  const picked = [...byCategory.values(), ...rest].slice(0, 6);

  const featured = picked.map((p) => {
    const prov = p.commerce_providers as { display_name?: string } | null;
    return {
      mockId: p.mock_id as string,
      category: p.category as string,
      title: p.title as string,
      priceVnd: p.price_vnd as number,
      unit: p.unit as string,
      providerName: prov?.display_name ?? null,
    };
  });

  const partners = (providers ?? []).map((p) => ({
    name: p.display_name as string,
    status: (p.status as string) || "listed",
    note: (p.source_note as string | null) ?? null,
  }));

  return (
    <LifestyleMarketplace
      featured={featured}
      partners={partners}
      searchQuery={q ?? null}
      t={t}
    />
  );
}
