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
      "id, mock_id, category, title, kind, description, price_vnd, unit, fulfillment, demo_banner, commerce_providers(display_name, status, source_note)",
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
    <div className="max-w-2xl">
      <Link
        href={`/lifestyle/${category}`}
        className="text-sm text-dm-muted underline"
      >
        {t("commerce.backCategory")}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {product.title}
      </h1>
      {prov?.display_name ? (
        <p className="mt-2 text-sm text-dm-muted">{prov.display_name}</p>
      ) : null}
      <Card className="mt-8 space-y-3 text-sm">
        <p>{product.description}</p>
        <p className="text-2xl font-bold text-dm-primary">
          {product.price_vnd.toLocaleString("vi-VN")}₫
          <span className="ml-2 text-sm font-normal text-dm-muted">
            / {product.unit}
          </span>
        </p>
        <p className="text-xs text-dm-muted">
          {t("commerce.fulfillmentNote", { mode: product.fulfillment })}
        </p>
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
          className="inline-block text-sm font-semibold text-dm-primary underline"
        >
          {t("commerce.cartView")}
        </Link>
      </Card>
    </div>
  );
}
