"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DemoBookButton({ productId }: { productId: string }) {
  const t = useT();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reserve() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/catalog/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          idempotency_key: `ui-${productId}-${Date.now()}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(resolveApiErrorMessage(json, t, "commerce.demoBookFailed"));
        return;
      }
      setMsg(json.receipt ?? "DEMO_RESERVED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={busy} onClick={() => void reserve()}>
        {busy ? t("commerce.demoCreating") : t("commerce.demoRequestCta")}
      </Button>
      {msg ? <p className="text-xs font-semibold text-[#9a4a2a]">{msg}</p> : null}
    </div>
  );
}
