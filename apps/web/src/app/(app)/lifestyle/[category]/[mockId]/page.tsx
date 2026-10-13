import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { Card } from "@/components/ui/Card";
import { AddToCartButton } from "@/components/lifestyle/AddToCartButton";
import { DemoBookButton } from "@/components/lifestyle/DemoBookButton";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; mockId: string }>;
}) {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const { category, mockId } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("commerce_products")
    .select(
      "id, mock_id, category, title, kind, description, price_vnd, unit, fulfillment, commerce_providers(display_name, status, source_note)",
    )
    .eq("mock_id", mockId)
    .eq("category", category)
    .eq("active", true)
    .maybeSingle();
  if (!product) notFound();

  const prov = product.commerce_providers as {
    display_name?: string;
    status?: string;
    source_note?: string;
  } | null;

  return (
    <div className="mx-auto w-full max-w-[720px] pb-12">
      <Link
        href={`/lifestyle/${category}`}
        className="text-sm font-semibold text-dm-muted underline-offset-2 hover:text-dm-primary hover:underline"
      >
        {t("commerce.backCategory")}
      </Link>

      <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("commerce.detailEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink sm:text-4xl">
        {product.title}
      </h1>
      {prov?.display_name ? (
        <p className="mt-2 text-sm text-dm-muted">
          {prov.display_name}
          {prov.status ? (
            <span className="ml-2 text-[11px] font-bold uppercase tracking-wide text-dm-champagne">
              {prov.status}
            </span>
          ) : null}
        </p>
      ) : null}

      <Card className="mt-8 space-y-4">
        <p className="text-sm leading-relaxed text-dm-ink">
          {product.description}
        </p>
        <p className="font-display text-3xl font-semibold text-dm-primary">
          {product.price_vnd.toLocaleString("vi-VN")}₫
          <span className="ml-2 text-sm font-normal text-dm-muted">
            / {product.unit}
          </span>
        </p>
        <p className="text-xs text-dm-muted">
          {t("commerce.fulfillmentNote", { mode: product.fulfillment })}
        </p>
        {prov?.source_note ? (
          <p className="rounded-xl bg-[#FAF7F4] px-3 py-2 text-xs text-dm-muted">
            {prov.source_note}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-dm-line pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <DemoBookButton productId={product.id} />
          <AddToCartButton
            productId={product.id}
            mockId={product.mock_id}
            title={product.title}
            category={product.category}
            priceVnd={product.price_vnd}
          />
          <Link
            href="/lifestyle/cart"
            className="text-sm font-semibold text-dm-primary underline underline-offset-2"
          >
            {t("commerce.cartView")}
          </Link>
        </div>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/places/map"
          className="rounded-[14px] border border-dm-line bg-dm-panel px-4 py-3 text-sm font-semibold text-dm-ink transition hover:border-dm-primary"
        >
          {t("commerce.dateMapLink")} →
        </Link>
        <Link
          href="/checkout/confirm"
          className="rounded-[14px] border border-dm-line bg-dm-panel px-4 py-3 text-sm font-semibold text-dm-ink transition hover:border-dm-primary"
        >
          {t("commerce.checkout")} →
        </Link>
      </div>
    </div>
  );
}
