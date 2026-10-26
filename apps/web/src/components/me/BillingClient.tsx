"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BillingClient({ billingOn }: { billingOn: boolean }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/v1/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });
      const json = (await res.json()) as {
        error?: { message?: string };
        data?: { checkout_url?: string };
      };
      if (!res.ok || !json.data?.checkout_url) {
        setNote(
          resolveApiErrorMessage(json, t, "commerce.billingUnavailable"),
        );
        return;
      }
      window.location.href = json.data.checkout_url;
    } finally {
      setBusy(false);
    }
  }

  if (!billingOn) {
    return (
      <p className="text-sm text-dm-muted">
        {t("commerce.billingOffEnv")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-dm-muted">
        {t("commerce.billingStripeHint")}
      </p>
      <Button type="button" size="sm" disabled={busy} onClick={() => void startCheckout()}>
        {busy ? t("commerce.billingOpening") : t("commerce.billingPayCta")}
      </Button>
      {note ? (
        <p className="text-sm text-dm-muted" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
