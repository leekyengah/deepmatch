import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDateTime } from "@deepmatch/i18n";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale, getServerTranslator } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MeOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/orders");
  const { t } = await getServerTranslator();
  const locale = await getRequestLocale();

  const { data: orders } = await supabase
    .from("checkout_orders")
    .select(
      "id, package_code, amount_vnd, currency, status, sandbox, created_at, expires_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("id, package_code, status, starts_at, ends_at, sandbox")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-lg pb-16">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("needs.backMe")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("commerce.ordersTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("commerce.ordersIntro")}</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-dm-champagne">
          {t("commerce.ordersHistory")}
        </h2>
        {!orders?.length ? (
          <EmptyState title={t("commerce.ordersEmpty")} />
        ) : (
          orders.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-dm-ink">{o.package_code}</p>
                  <p className="mt-1 text-sm text-dm-muted">
                    {o.amount_vnd.toLocaleString(locale)} {o.currency}
                  </p>
                  <p className="mt-1 text-xs text-dm-muted">
                    {formatDateTime(o.created_at, locale)}
                  </p>
                </div>
                <Badge tone={o.status === "paid" ? "good" : "default"}>
                  {o.status}
                </Badge>
              </div>
              {o.status === "paid" ? (
                <p className="mt-3 text-xs text-dm-muted">
                  {t("commerce.ordersReceipt", { id: o.id.slice(0, 8) })}
                </p>
              ) : null}
            </Card>
          ))
        )}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-dm-champagne">
          {t("commerce.entitlementsTitle")}
        </h2>
        {!entitlements?.length ? (
          <p className="text-sm text-dm-muted">{t("commerce.entitlementsEmpty")}</p>
        ) : (
          entitlements.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-dm-ink">{e.package_code}</p>
                  <p className="mt-1 text-xs text-dm-muted">
                    {e.starts_at ? formatDateTime(e.starts_at, locale) : "—"}
                  </p>
                </div>
                <Badge tone={e.status === "active" ? "good" : "default"}>
                  {e.status}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </section>

      <p className="mt-8 text-sm">
        <Link href="/checkout/confirm" className="text-dm-primary underline">
          {t("commerce.checkoutTitle")}
        </Link>
      </p>
    </main>
  );
}
