import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getServerTranslator } from "@/lib/i18n/server";

const SLUGS = new Set([
  "gift",
  "fashion",
  "beauty",
  "venue",
  "travel",
  "safety",
]);

const titles: Record<string, string> = {
  gift: "DeepGift",
  fashion: "DeepStyle",
  beauty: "DeepBeauty",
  venue: "DeepDate",
  travel: "DeepTravel",
  safety: "DeepSafe",
};

export default async function LifestyleCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ band?: string }>;
}) {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const { category } = await params;
  const { band } = await searchParams;
  if (!SLUGS.has(category)) notFound();

  const supabase = await createClient();
  let query = supabase
    .from("commerce_products")
    .select(
      "id, mock_id, title, price_vnd, unit, demo_banner, commerce_providers(display_name, status)",
    )
    .eq("category", category)
    .eq("active", true)
    .order("price_vnd", { ascending: true });

  // DeepDate (venue) DEMO price bands — sample inventory only
  if (category === "venue" && band === "low") {
    query = query.lte("price_vnd", 300000);
  } else if (category === "venue" && band === "mid") {
    query = query.gt("price_vnd", 300000).lte("price_vnd", 800000);
  } else if (category === "venue" && band === "high") {
    query = query.gt("price_vnd", 800000);
  }

  const { data: products } = await query;

  return (
    <div className="max-w-3xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        ← Lifestyle
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {titles[category]}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("commerce.categoryDemoNote")}
      </p>
      <div className="mt-4">
        <Badge tone="warn">
          {t("commerce.lifestyleBadge")}
        </Badge>
      </div>
      {category === "venue" ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-dm-primary">
          <Link href="/lifestyle/venue">Tất cả</Link>
          <Link href="/lifestyle/venue?band=low">≤300k</Link>
          <Link href="/lifestyle/venue?band=mid">300–800k</Link>
          <Link href="/lifestyle/venue?band=high">&gt;800k</Link>
        </div>
      ) : null}
      {category === "venue" ? (
        <p className="mt-3 text-xs text-dm-muted">
          {t("commerce.categoryDemoNote")}
        </p>
      ) : null}

      {!products?.length ? (
        <div className="mt-10">
          <EmptyState
            title={t("commerce.categoryEmptyTitle")}
            description={t("commerce.categoryEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {products.map((p) => {
            const prov = p.commerce_providers as {
              display_name?: string;
              status?: string;
            } | null;
            return (
              <li key={p.id}>
                <Link href={`/lifestyle/${category}/${p.mock_id}`}>
                  <Card className="text-sm transition hover:border-dm-primary">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-dm-raspberry">
                          {p.title}
                        </p>
                        <p className="mt-1 text-xs text-dm-muted">
                          {p.mock_id} · {prov?.display_name ?? t("common.optional")} ·{" "}
                          {prov?.status ?? t("common.optional")}
                        </p>
                      </div>
                      <p className="font-bold text-dm-primary">
                        {p.price_vnd.toLocaleString("vi-VN")}₫
                        <span className="ml-1 text-xs font-normal text-dm-muted">
                          / {p.unit}
                        </span>
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-[#9a4a2a]">
                      {p.demo_banner}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
