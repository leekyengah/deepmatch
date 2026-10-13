"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/components/ui/cn";

type Order = {
  id: string;
  sku: string;
  package_code: string | null;
  amount_vnd: number;
  status: string;
  sandbox: boolean;
};

const STEPS = [
  "confirm",
  "method",
  "qr",
  "processing",
  "success",
  "failed",
] as const;

const FLOW = ["confirm", "method", "qr"] as const;

export function CheckoutClient({
  packageCode,
  step,
}: {
  packageCode?: string;
  step: (typeof STEPS)[number];
}) {
  const t = useT();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "qr" | "wallet">("qr");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const res = await fetch("/api/v1/checkout/orders");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = (await res.json()) as { data?: { orders?: Order[] } };
      const existing = (json.data?.orders ?? []).find((o) =>
        ["draft", "pending_payment", "method_selected", "processing"].includes(
          o.status,
        ),
      );
      setOrder(existing ?? null);
      setLoading(false);
    })();
  }, []);

  async function createOrder() {
    setBusy(true);
    const res = await fetch("/api/v1/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_code: packageCode }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "booking.bookRequestFailed"));
      return;
    }
    const json = (await res.json()) as { data?: { order?: Order } };
    setOrder(json.data?.order ?? null);
    setMessage(t("commerce.checkoutOrderCreated"));
  }

  async function act(action: string, payMethod?: string) {
    if (!order) return;
    setBusy(true);
    const res = await fetch(`/api/v1/checkout/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, method: payMethod }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "booking.bookRequestFailed"));
      return;
    }
    const json = (await res.json()) as { data?: { order?: Order } };
    setOrder(json.data?.order ?? null);
  }

  if (loading) return <LoadingState label={t("common.loading")} />;

  const amount = order?.amount_vnd ?? 599_000;
  const flowIndex =
    step === "confirm" ? 0 : step === "method" ? 1 : step === "qr" || step === "processing" ? 2 : -1;

  return (
    <div className="space-y-6">
      <Badge tone="warn">{t("commerce.checkoutSandboxBadge")}</Badge>

      {/* Stepper — mockup 3 steps */}
      <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
        {[
          t("commerce.checkoutStepConfirm"),
          t("commerce.checkoutStepMethod"),
          t("commerce.checkoutStepComplete"),
        ].map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 ? <span className="text-dm-line">—</span> : null}
            <span
              className={cn(
                "rounded-full px-3 py-1",
                flowIndex === i
                  ? "bg-dm-primary text-white"
                  : "bg-dm-surface text-dm-muted",
              )}
            >
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {!order ? (
            <Card className="space-y-3">
              <p className="text-sm text-dm-muted">{t("commerce.checkoutNeedOrder")}</p>
              <Button type="button" disabled={busy} onClick={() => void createOrder()}>
                {t("commerce.checkoutCreateOrder")}
              </Button>
            </Card>
          ) : null}

          {order && step === "confirm" ? (
            <Card className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dm-blush text-xl">
                  ♛
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-dm-ink">
                    DeepMatch Premium 30 ngày
                  </h2>
                  <p className="mt-1 text-sm text-dm-muted">
                    {order.package_code}
                  </p>
                </div>
              </div>
              <ul className="grid gap-2 text-sm text-dm-ink sm:grid-cols-3">
                <li className="rounded-xl bg-dm-surface px-3 py-2">
                  {t("commerce.benefitDiscover")}
                </li>
                <li className="rounded-xl bg-dm-surface px-3 py-2">
                  {t("commerce.benefitFilters")}
                </li>
                <li className="rounded-xl bg-dm-surface px-3 py-2">
                  {t("commerce.benefitDepth")}
                </li>
              </ul>
              <div className="rounded-xl border border-dm-primary/30 bg-[#FBF3F5] px-4 py-3">
                <p className="text-sm font-semibold text-dm-ink">
                  {t("commerce.checkoutOneTime")} ·{" "}
                  {amount.toLocaleString("vi-VN")} ₫
                </p>
                <p className="mt-1 text-xs text-dm-muted">
                  {t("commerce.checkoutNoRenew")}
                </p>
              </div>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void act("select_method")}
              >
                {t("commerce.checkoutContinueMethod")} →
              </Button>
            </Card>
          ) : null}

          {order && step === "method" ? (
            <Card className="space-y-4">
              <Link href="/checkout/confirm" className="text-sm text-dm-muted underline">
                {t("common.back")}
              </Link>
              <h2 className="font-display text-xl font-semibold text-dm-ink">
                {t("commerce.checkoutChooseMethod")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["card", t("commerce.checkoutMethodCard")],
                    ["qr", t("commerce.checkoutMethodQr")],
                    ["wallet", t("commerce.checkoutMethodWallet")],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={cn(
                      "rounded-2xl border px-3 py-4 text-left text-sm font-semibold transition",
                      method === id
                        ? "border-dm-primary bg-[#FBF3F5] text-dm-primary"
                        : "border-dm-line bg-dm-panel text-dm-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                disabled={busy}
                onClick={() =>
                  void act(
                    method === "qr" ? "mark_processing" : "select_method",
                    method === "qr" ? "sandbox_qr" : "sandbox_bank",
                  )
                }
              >
                {t("commerce.checkoutPayAmount", {
                  amount: amount.toLocaleString("vi-VN"),
                })}{" "}
                →
              </Button>
            </Card>
          ) : null}

          {order && (step === "qr" || step === "processing") ? (
            <Card className="space-y-4 text-center">
              <h2 className="font-display text-xl font-semibold text-dm-ink">
                {step === "processing"
                  ? t("commerce.checkoutProcessingHeading")
                  : t("commerce.checkoutQrHeading")}
              </h2>
              {step === "qr" ? (
                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-dm-line bg-dm-surface text-sm text-dm-muted">
                  QR
                </div>
              ) : (
                <div className="mx-auto h-16 w-16 animate-pulse rounded-full border-4 border-dm-primary/30 border-t-dm-primary" />
              )}
              <p className="font-display text-2xl font-semibold text-dm-primary">
                {amount.toLocaleString("vi-VN")} ₫
              </p>
              <p className="text-xs text-dm-muted">
                {t("commerce.checkoutOrderId")}: {order.id.slice(0, 8)}…
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void act("sandbox_succeed")}
                >
                  {t("commerce.checkoutSimulatePaid")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void act("sandbox_fail")}
                >
                  {t("commerce.checkoutSimulateFail")}
                </Button>
              </div>
            </Card>
          ) : null}

          {step === "success" || order?.status === "paid" ? (
            <Card className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
                ✓
              </div>
              <h2 className="font-display text-2xl font-semibold text-dm-ink">
                {t("commerce.checkoutPaidOk")}
              </h2>
              <Link href="/discover">
                <Button type="button">{t("commerce.checkoutExplore")} →</Button>
              </Link>
            </Card>
          ) : null}

          {step === "failed" || order?.status === "failed" ? (
            <Card className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-700">
                !
              </div>
              <h2 className="font-display text-2xl font-semibold text-dm-ink">
                {t("commerce.checkoutFailedBody")}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" disabled={busy} onClick={() => void createOrder()}>
                  {t("commerce.checkoutRetry")}
                </Button>
                <Link href="/checkout/method">
                  <Button type="button" variant="outline">
                    {t("commerce.checkoutMethodOther")}
                  </Button>
                </Link>
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          <Card className="sticky top-4 space-y-3">
            <h3 className="font-semibold text-dm-ink">
              {t("commerce.checkoutSummary")}
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-dm-muted">Premium 30 ngày</span>
              <span className="font-semibold text-dm-ink">
                {amount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="border-t border-dm-line pt-3">
              <p className="text-xs text-dm-muted">{t("commerce.checkoutTotal")}</p>
              <p className="font-display text-3xl font-semibold text-dm-primary">
                {amount.toLocaleString("vi-VN")} ₫
              </p>
            </div>
            <p className="rounded-xl bg-[#FBF3F5] px-3 py-2 text-xs text-dm-ink">
              {t("commerce.checkoutNoRenew")}
            </p>
          </Card>
        </aside>
      </div>

      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs text-dm-muted">
        {FLOW.map((s) => (
          <Link key={s} href={`/checkout/${s}`} className="underline">
            {s}
          </Link>
        ))}
        <Link href="/checkout/success" className="underline">
          success
        </Link>
        <Link href="/checkout/failed" className="underline">
          failed
        </Link>
      </div>
    </div>
  );
}
