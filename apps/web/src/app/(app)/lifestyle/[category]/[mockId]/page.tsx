import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DemoBookButton } from "@/components/lifestyle/DemoBookButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; mockId: string }>;
}) {
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
        ← Danh mục
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {product.title}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {product.mock_id} · {product.kind}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="warn">{product.demo_banner}</Badge>
        <Badge tone="default">{prov?.status ?? "DEMO"}</Badge>
      </div>
      <Card className="mt-8 space-y-3 text-sm">
        <p>{product.description}</p>
        <p className="text-dm-muted">
          Provider: {prov?.display_name} · {prov?.source_note}
        </p>
        <p className="text-2xl font-bold text-dm-primary">
          {product.price_vnd.toLocaleString("vi-VN")}₫
          <span className="ml-2 text-sm font-normal text-dm-muted">
            / {product.unit}
          </span>
        </p>
        <p className="text-xs text-dm-muted">
          Fulfillment: {product.fulfillment} — không có giờ mở cửa / tồn kho thật.
        </p>
        <DemoBookButton productId={product.id} />
      </Card>
    </div>
  );
}
