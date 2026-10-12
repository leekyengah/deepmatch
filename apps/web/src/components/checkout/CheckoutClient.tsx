"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

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

const STEP_LABEL: Record<(typeof STEPS)[number], string> = {
  confirm: "commerce.checkoutStepConfirm",
  method: "commerce.checkoutStepMethod",
  qr: "commerce.checkoutStepQr",
  processing: "commerce.checkoutStepProcessing",
  success: "commerce.checkoutStepSuccess",
  failed: "commerce.checkoutStepFailed",
};

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

  async function act(action: string, method?: string) {
    if (!order) return;
    setBusy(true);
    const res = await fetch(`/api/v1/checkout/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, method }),
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <Badge key={s} tone={s === step ? "good" : "default"}>
            {t(STEP_LABEL[s])}
          </Badge>
        ))}
      </div>
      <Badge tone="warn">{t("commerce.checkoutSandboxBadge")}</Badge>

      {!order ? (
        <Card className="space-y-3 text-sm">
          <p>{t("commerce.checkoutNeedOrder")}</p>
          <Button type="button" disabled={busy} onClick={() => void createOrder()}>
            {t("commerce.checkoutCreateOrder")}
          </Button>
        </Card>
      ) : (
        <Card className="space-y-3 text-sm">
          <p className="font-semibold text-dm-ink">
            {order.package_code} · {order.amount_vnd.toLocaleString("vi-VN")} ₫
          </p>
          <p className="text-dm-muted">
            {t("commerce.checkoutStatus")}: {order.status}
          </p>
          {step === "confirm" ? (
            <Button type="button" disabled={busy} onClick={() => void act("select_method")}>
              {t("commerce.checkoutContinueMethod")}
            </Button>
          ) : null}
          {step === "method" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busy}
                onClick={() => void act("select_method", "sandbox_bank")}
              >
                {t("commerce.checkoutMethodBank")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void act("mark_processing", "sandbox_qr")}
              >
                {t("commerce.checkoutMethodQr")}
              </Button>
            </div>
          ) : null}
          {step === "qr" || step === "processing" ? (
            <div className="space-y-2">
              <p className="text-dm-muted">{t("commerce.checkoutQrHint")}</p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          ) : null}
          {step === "success" || order.status === "paid" ? (
            <p role="status">{t("commerce.checkoutPaidOk")}</p>
          ) : null}
          {step === "failed" || order.status === "failed" ? (
            <div className="space-y-2">
              <p>{t("commerce.checkoutFailedBody")}</p>
              <Button type="button" disabled={busy} onClick={() => void createOrder()}>
                {t("commerce.checkoutRetry")}
              </Button>
            </div>
          ) : null}
        </Card>
      )}

      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        {STEPS.map((s, i) => (
          <Link key={s} href={`/checkout/${s}`} className="underline">
            {i + 1}
          </Link>
        ))}
        <Link href="/me/journey" className="underline">
          {t("booking.journeyTitle")}
        </Link>
      </div>
    </div>
  );
}
