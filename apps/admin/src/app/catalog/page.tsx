import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  setProductActiveAction,
  setProviderStatusAction,
} from "./actions";

const STATUS_OPTS = ["DEMO", "TEST", "VERIFIED"] as const;

export default async function AdminCatalogPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const [{ data: providers }, { data: products, count }, { data: bookings }] =
    await Promise.all([
      supabase
        .from("commerce_providers")
        .select("id, slug, display_name, category, status, source_note")
        .order("category")
        .limit(80),
      supabase
        .from("commerce_products")
        .select("id, mock_id, title, category, price_vnd, active, demo_banner")
        .order("category")
        .limit(40),
      supabase
        .from("commerce_demo_bookings")
        .select("id, status, quote_vnd, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-dm-raspberry">Catalog DEMO</h1>
      <p className="mt-2 text-sm text-dm-muted">{t("admin.catalogIntro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="good">
          {t("admin.productsCount", { n: count ?? products?.length ?? 0 })}
        </Badge>
        <Badge tone="warn">{t("admin.liveGateOff")}</Badge>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-dm-raspberry">
        {t("admin.providersHeading")}
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(providers ?? []).map((p) => (
          <Card key={p.id} className="text-xs">
            <p className="font-semibold text-dm-raspberry">{p.display_name}</p>
            <p className="text-dm-muted">
              {p.category} · {p.slug}
            </p>
            <form
              action={setProviderStatusAction}
              className="mt-2 flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="provider_id" value={p.id} />
              <select
                name="status"
                defaultValue={p.status}
                className="rounded border border-dm-line bg-white px-2 py-1"
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full bg-dm-primary px-3 py-1 text-[11px] font-semibold text-white"
              >
                {t("admin.saveStatus")}
              </button>
            </form>
            {p.source_note ? (
              <p className="mt-1 text-[10px] text-dm-muted">{p.source_note}</p>
            ) : null}
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-dm-raspberry">
        {t("admin.productsHeading")}
      </h2>
      <ul className="mt-3 space-y-2">
        {(products ?? []).map((p) => (
          <li key={p.id}>
            <Card className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-semibold text-dm-raspberry">{p.title}</p>
                <p className="text-dm-muted">
                  {p.category} · {p.mock_id} ·{" "}
                  {Number(p.price_vnd).toLocaleString("vi-VN")}₫
                  {p.demo_banner ? " · DEMO" : ""}
                </p>
              </div>
              <form action={setProductActiveAction} className="flex gap-2">
                <input type="hidden" name="product_id" value={p.id} />
                <input
                  type="hidden"
                  name="active"
                  value={p.active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="rounded-full border border-dm-line px-3 py-1 text-[11px] font-semibold text-dm-raspberry"
                >
                  {p.active ? t("admin.disable") : t("admin.enable")}
                </button>
              </form>
            </Card>
          </li>
        ))}
      </ul>

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
