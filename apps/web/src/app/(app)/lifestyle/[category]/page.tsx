import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

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
}: {
  params: Promise<{ category: string }>;
}) {
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const { category } = await params;
  if (!SLUGS.has(category)) notFound();

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("commerce_products")
    .select(
      "id, mock_id, title, price_vnd, unit, demo_banner, commerce_providers(display_name, status)",
    )
    .eq("category", category)
    .eq("active", true)
    .order("price_vnd", { ascending: true });

  return (
    <div className="max-w-3xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        ← Lifestyle
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        {titles[category]}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Nhà cung cấp trạng thái DEMO · SANDBOX_ONLY
      </p>
      <div className="mt-4">
        <Badge tone="warn">
          BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT
        </Badge>
      </div>

      {!products?.length ? (
        <div className="mt-10">
          <EmptyState
            title="Chưa có mẫu"
            description="Chạy seed catalog trên staging hoặc thử lại sau."
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
                          {p.mock_id} · {prov?.display_name ?? "DEMO"} ·{" "}
                          {prov?.status ?? "DEMO"}
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
