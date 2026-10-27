import { redirect } from "next/navigation";
import { isCustomerVisibleProviderStatus } from "@deepmatch/shared";
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
        "mock_id, category, title, price_vnd, unit, fulfillment, commerce_providers(display_name, status)",
      )
      .eq("active", true)
      .gt("price_vnd", 0)
      .order("price_vnd", { ascending: false })
      .limit(48),
    supabase
      .from("commerce_providers")
      .select("display_name, status")
      .order("display_name", { ascending: true })
      .limit(24),
  ]);

  // One product per category first, then fill — skips DEMO/sandbox providers.
  type Row = NonNullable<typeof products>[number];
  const visibleProducts = (products ?? []).filter((p) => {
    const prov = p.commerce_providers as { status?: string } | null;
    return isCustomerVisibleProviderStatus(prov?.status);
  });
  const byCategory = new Map<string, Row>();
  const rest: Row[] = [];
  for (const p of visibleProducts) {
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

  const partners = (providers ?? [])
    .filter((p) => isCustomerVisibleProviderStatus(p.status as string))
    .slice(0, 8)
    .map((p) => ({
      name: p.display_name as string,
      status: "listed",
      note: null as string | null,
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
