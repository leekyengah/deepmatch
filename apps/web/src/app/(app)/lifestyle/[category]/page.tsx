import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
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

const coverByCategory: Record<string, string> = {
  gift: "/fixtures/home/suggest-1.jpg",
  fashion: "/fixtures/home/suggest-2.jpg",
  beauty: "/fixtures/home/suggest-3.jpg",
  venue: "/fixtures/home/map-1.jpg",
  travel: "/fixtures/home/map-2.jpg",
  safety: "/fixtures/home/article-1.jpg",
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
      "id, mock_id, title, price_vnd, unit, description, commerce_providers(display_name, status)",
    )
    .eq("category", category)
    .eq("active", true)
    .order("price_vnd", { ascending: true });

  if (category === "venue" && band === "low") {
    query = query.lte("price_vnd", 300000);
  } else if (category === "venue" && band === "mid") {
    query = query.gt("price_vnd", 300000).lte("price_vnd", 800000);
  } else if (category === "venue" && band === "high") {
    query = query.gt("price_vnd", 800000);
  }

  const { data: products } = await query;

  return (
    <div className="dm-page-frame dm-page-frame--standard pb-12">
      <Link
        href="/lifestyle"
        className="text-sm font-semibold text-dm-muted underline-offset-2 hover:text-dm-primary hover:underline"
      >
        ← {t("commerce.lifestyle")}
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(36,26,28,0.08)]">
        <div className="relative min-h-[160px] sm:min-h-[200px]">
          <Image
            src={coverByCategory[category] ?? "/fixtures/home/hero-city.jpg"}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1000px) 100vw, 1000px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#241A1C]/80 to-transparent" />
          <div className="relative p-5 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/70">
              {t("commerce.listingEyebrow")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-white sm:text-4xl">
              {titles[category]}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              {t("commerce.categoryDemoNote")}
            </p>
          </div>
        </div>
      </section>

      {category === "venue" ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["", t("commerce.bandAll")],
              ["low", "≤300k"],
              ["mid", "300–800k"],
              ["high", ">800k"],
            ] as const
          ).map(([value, label]) => {
            const active = (band ?? "") === value;
            const href = value
              ? `/lifestyle/venue?band=${value}`
              : "/lifestyle/venue";
            return (
              <Link
                key={label}
                href={href}
                className={
                  active
                    ? "rounded-full bg-[#6B2D3C] px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-full border border-dm-line px-3 py-1.5 text-sm font-semibold text-dm-muted hover:border-dm-primary hover:text-dm-primary"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {!products?.length ? (
        <div className="mt-10">
          <EmptyState
            title={t("commerce.categoryEmptyTitle")}
            description={t("commerce.categoryEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {products.map((p) => {
            const prov = p.commerce_providers as {
              display_name?: string;
              status?: string;
            } | null;
            return (
              <li key={p.id}>
                <Link href={`/lifestyle/${category}/${p.mock_id}`}>
                  <Card className="h-full transition hover:border-dm-primary">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-semibold text-dm-ink">
                          {p.title}
                        </p>
                        <p className="mt-1 text-xs text-dm-muted">
                          {prov?.display_name ?? t("common.optional")}
                        </p>
                        {p.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-dm-muted">
                            {p.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-bold text-dm-primary">
                        {p.price_vnd.toLocaleString("vi-VN")}₫
                        <span className="ml-1 text-xs font-normal text-dm-muted">
                          / {p.unit}
                        </span>
                      </p>
                    </div>
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
