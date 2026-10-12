import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AdminCatalogPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const [{ data: providers }, { count: products }, { data: bookings }] =
    await Promise.all([
      supabase
        .from("commerce_providers")
        .select("id, slug, display_name, category, status, source_note")
        .order("category")
        .limit(80),
      supabase
        .from("commerce_products")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("commerce_demo_bookings")
        .select("id, status, quote_vnd, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-dm-raspberry">Catalog DEMO</h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.catalogIntro")}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="good">{t("admin.productsCount", { n: products ?? 0 })}</Badge>
        <Badge tone="warn">LIVE gate: OFF</Badge>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-dm-raspberry">
        Providers
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(providers ?? []).slice(0, 24).map((p) => (
          <Card key={p.id} className="text-xs">
            <p className="font-semibold text-dm-raspberry">{p.display_name}</p>
            <p className="text-dm-muted">
              {p.category} · {p.status}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-dm-raspberry">
        {t("admin.recentDemoBookings")}
      </h2>
      <ul className="mt-3 space-y-2">
        {(bookings ?? []).map((b) => (
          <li key={b.id}>
            <Card className="text-xs">
              {b.status} · {b.quote_vnd.toLocaleString("vi-VN")}₫ ·{" "}
              {new Date(b.created_at).toLocaleString("vi-VN")}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
