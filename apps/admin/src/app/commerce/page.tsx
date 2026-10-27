import { formatDateTime, formatNumber } from "@deepmatch/i18n";
import { COMMERCE_SKU_CLASSES } from "@deepmatch/shared";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  staffBookingTransitionAction,
  staffOrderTransitionAction,
} from "./actions";

export default async function AdminCommercePage() {
  const { t, locale } = await getServerTranslator();
  const supabase = await createClient();

  const [{ data: bookings }, { data: refundOrders }, { data: paidOrders }, { data: audit }] =
    await Promise.all([
      supabase
        .from("service_bookings")
        .select(
          "id, status, requester_id, advisor_id, created_at, service_offerings(title)",
        )
        .in("status", [
          "requested",
          "assigned",
          "completed",
          "cancelled",
          "refund_requested",
          "refunded_sandbox",
        ])
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("checkout_orders")
        .select("id, status, user_id, amount_vnd, sku, package_code, created_at")
        .eq("status", "refund_requested")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("checkout_orders")
        .select("id, status, amount_vnd, created_at, package_code, sku")
        .in("status", ["paid", "refund_requested", "refunded_sandbox", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(80),
      supabase
        .from("commerce_audit_log")
        .select("id, entity_type, entity_id, action, from_status, to_status, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const sandboxPaid = (paidOrders ?? []).filter((o) => o.status === "paid");
  const sandboxRefunded = (paidOrders ?? []).filter(
    (o) => o.status === "refunded_sandbox",
  );
  const revenueVnd = sandboxPaid.reduce((s, o) => s + (o.amount_vnd ?? 0), 0);
  const refundedVnd = sandboxRefunded.reduce(
    (s, o) => s + (o.amount_vnd ?? 0),
    0,
  );

  const refundBookings = (bookings ?? []).filter(
    (b) => b.status === "refund_requested",
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-dm-raspberry">
          {t("admin.commerceFull")}
        </h1>
        <p className="mt-2 text-sm text-dm-muted">{t("admin.commerceIntro")}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-dm-primary">
          {t("admin.commerceSandboxOnly")}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-dm border border-dm-line bg-dm-panel p-4">
          <p className="text-xs text-dm-muted">{t("admin.commerceRevenue")}</p>
          <p className="mt-1 text-xl font-bold text-dm-raspberry">
            {formatNumber(revenueVnd, locale)}₫
          </p>
        </div>
        <div className="rounded-dm border border-dm-line bg-dm-panel p-4">
          <p className="text-xs text-dm-muted">{t("admin.commerceRefunded")}</p>
          <p className="mt-1 text-xl font-bold text-dm-raspberry">
            {formatNumber(refundedVnd, locale)}₫
          </p>
        </div>
        <div className="rounded-dm border border-dm-line bg-dm-panel p-4">
          <p className="text-xs text-dm-muted">{t("admin.commerceOpenRefunds")}</p>
          <p className="mt-1 text-xl font-bold text-dm-raspberry">
            {refundBookings.length + (refundOrders?.length ?? 0)}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("admin.commerceSkuSplit")}
        </h2>
        <ul className="mt-3 space-y-2">
          {COMMERCE_SKU_CLASSES.map((sku) => (
            <li
              key={sku.code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-dm border border-dm-line bg-dm-panel px-3 py-2 text-sm"
            >
              <span className="font-semibold">{sku.code}</span>
              <Badge tone={sku.kind === "digital_entitlement" ? "warn" : "good"}>
                {sku.kind} · {sku.storeBilling}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("admin.commerceRefundQueue")}
        </h2>
        {!refundBookings.length && !refundOrders?.length ? (
          <div className="mt-4">
            <EmptyState
              title={t("admin.commerceRefundEmptyTitle")}
              description={t("admin.commerceRefundEmptyBody")}
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {refundBookings.map((b) => {
              const offering = Array.isArray(b.service_offerings)
                ? b.service_offerings[0]
                : b.service_offerings;
              const title =
                (offering as { title?: string } | null)?.title ??
                t("booking.serviceDefault");
              return (
                <li
                  key={b.id}
                  className="rounded-dm border border-dm-line bg-dm-panel p-4 text-sm"
                >
                  <Badge tone="warn">booking · {b.status}</Badge>
                  <p className="mt-2 font-semibold text-dm-raspberry">{title}</p>
                  <p className="text-xs text-dm-muted">
                    {b.id.slice(0, 8)}… ·{" "}
                    {formatDateTime(b.created_at, locale)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={staffBookingTransitionAction}>
                      <input type="hidden" name="booking_id" value={b.id} />
                      <input
                        type="hidden"
                        name="action"
                        value="approve_sandbox_refund"
                      />
                      <button
                        type="submit"
                        className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                      >
                        {t("admin.commerceApproveSandbox")}
                      </button>
                    </form>
                    <form action={staffBookingTransitionAction}>
                      <input type="hidden" name="booking_id" value={b.id} />
                      <input type="hidden" name="action" value="deny_refund" />
                      <button
                        type="submit"
                        className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                      >
                        {t("admin.commerceDenyRefund")}
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
            {(refundOrders ?? []).map((o) => (
              <li
                key={o.id}
                className="rounded-dm border border-dm-line bg-dm-panel p-4 text-sm"
              >
                <Badge tone="warn">order · {o.status}</Badge>
                <p className="mt-2 font-semibold text-dm-raspberry">
                  {formatNumber(o.amount_vnd ?? 0, locale)}₫ ·{" "}
                  {o.package_code ?? o.sku ?? "—"}
                </p>
                <p className="text-xs text-dm-muted">
                  {o.id.slice(0, 8)}… · {formatDateTime(o.created_at, locale)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={staffOrderTransitionAction}>
                    <input type="hidden" name="order_id" value={o.id} />
                    <input
                      type="hidden"
                      name="action"
                      value="approve_sandbox_refund"
                    />
                    <button
                      type="submit"
                      className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                    >
                      {t("admin.commerceApproveSandbox")}
                    </button>
                  </form>
                  <form action={staffOrderTransitionAction}>
                    <input type="hidden" name="order_id" value={o.id} />
                    <input type="hidden" name="action" value="deny_refund" />
                    <button
                      type="submit"
                      className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                    >
                      {t("admin.commerceDenyRefund")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("admin.commerceBookings")}
        </h2>
        {!bookings?.length ? (
          <p className="mt-3 text-sm text-dm-muted">{t("admin.servicesEmptyTitle")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {bookings.map((b) => {
              const offering = Array.isArray(b.service_offerings)
                ? b.service_offerings[0]
                : b.service_offerings;
              const title =
                (offering as { title?: string } | null)?.title ?? "—";
              return (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-dm border border-dm-line bg-dm-panel px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-semibold">{title}</span>
                    <span className="ml-2 text-xs text-dm-muted">{b.status}</span>
                  </span>
                  {b.status === "assigned" ? (
                    <form action={staffBookingTransitionAction}>
                      <input type="hidden" name="booking_id" value={b.id} />
                      <input type="hidden" name="action" value="complete" />
                      <button
                        type="submit"
                        className="rounded-dm border border-dm-line px-2 py-1 text-xs font-semibold"
                      >
                        {t("admin.commerceComplete")}
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("admin.commerceAudit")}
        </h2>
        {!audit?.length ? (
          <p className="mt-3 text-sm text-dm-muted">{t("admin.commerceAuditEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-1 text-xs text-dm-muted">
            {audit.map((row) => (
              <li key={row.id}>
                {formatDateTime(row.created_at, locale)} · {row.entity_type}{" "}
                {row.entity_id.slice(0, 8)}… · {row.action} · {row.from_status}→
                {row.to_status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
