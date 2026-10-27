import { formatDateTime, formatNumber } from "@deepmatch/i18n";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { confirmBankPaymentAction } from "./actions";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AdminBillingPage() {
  const { t, locale } = await getServerTranslator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, user_id, amount_cents, status, provider, metadata, created_at")
    .eq("provider", "bank_hd")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">
        {t("admin.billingFull")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.billingIntro")}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700">{error.message}</p>
      ) : null}

      {!data?.length ? (
        <div className="mt-6">
          <EmptyState
            title={t("admin.billingEmptyTitle")}
            description={t("admin.billingEmptyBody")}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.map((p) => {
            const code =
              (p.metadata as { transfer_code?: string } | null)?.transfer_code ??
              "—";
            return (
              <li
                key={p.id}
                className="rounded-dm border border-dm-line bg-dm-panel p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge tone={p.status === "paid" ? "good" : "warn"}>
                      {p.status}
                    </Badge>
                    <p className="mt-2 font-semibold text-dm-raspberry">
                      {t("admin.billingAmount", {
                        amount: formatNumber(p.amount_cents, locale),
                        code,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-dm-muted">
                      user {p.user_id.slice(0, 8)}… ·{" "}
                      {formatDateTime(p.created_at, locale)}
                    </p>
                    <p className="mt-1 text-xs text-dm-muted">
                      {t("admin.billingExpected", { code })}
                    </p>
                  </div>
                  {p.status === "pending" ? (
                    <form action={confirmBankPaymentAction}>
                      <input type="hidden" name="payment_id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-dm border border-dm-line px-3 py-1.5 text-xs font-semibold"
                      >
                        {t("admin.billingConfirm")}
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
