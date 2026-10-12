"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { formatNumber } from "@deepmatch/i18n";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  cartTotalVnd,
  clearDemoCart,
  readDemoCart,
  removeDemoCartLine,
  type DemoCartLine,
} from "@/lib/demo-cart";

export function DemoCartClient() {
  const t = useT();
  const { locale } = useI18n();
  const [lines, setLines] = useState<DemoCartLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLines(readDemoCart());
  }, []);

  async function checkoutSandbox() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/catalog/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            product_id: l.productId,
            qty: l.qty,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(resolveApiErrorMessage(json, t, "commerce.cartCheckoutFailed"));
        return;
      }
      clearDemoCart();
      setLines([]);
      setMsg(
        json.banner ??
          t("commerce.cartCheckoutOk"),
      );
    } finally {
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-dm-muted">{t("commerce.cartEmpty")}</p>
        <Link href="/lifestyle" className="text-sm font-semibold text-dm-primary">
          {t("commerce.cartBackLifestyle")}
        </Link>
        {msg ? <p className="text-sm font-semibold text-[#9a4a2a]">{msg}</p> : null}
      </div>
    );
  }

  const total = cartTotalVnd(lines);

  return (
    <div className="space-y-6">
      <p className="rounded-dm border border-dm-line bg-dm-blush px-3 py-2 text-xs font-semibold text-dm-deep">
        {t("commerce.cartBanner")}
      </p>
      <ul className="space-y-3">
        {lines.map((l) => (
          <li
            key={l.productId}
            className="flex items-start justify-between gap-4 border-b border-dm-line pb-3 text-sm"
          >
            <div>
              <p className="font-semibold text-dm-raspberry">{l.title}</p>
              <p className="text-xs text-dm-muted">
                {l.mockId} · {l.category} · x{l.qty}
              </p>
            </div>
            <div className="text-right">
              <p>{`${formatNumber(l.priceVnd * l.qty, locale)}₫`}</p>
              <button
                type="button"
                className="mt-1 text-xs text-dm-danger"
                onClick={() => setLines(removeDemoCartLine(l.productId))}
              >
                {t("commerce.cartRemove")}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm font-semibold text-dm-raspberry">
        {t("commerce.cartTotal", { amount: `${formatNumber(total, locale)}₫` })}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={busy} onClick={() => void checkoutSandbox()}>
          {busy ? t("commerce.cartProcessing") : t("commerce.cartCheckout")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearDemoCart();
            setLines([]);
          }}
        >
          {t("commerce.cartClear")}
        </Button>
        <Link href="/lifestyle/orders" className="text-sm font-semibold text-dm-primary self-center">
          {t("commerce.cartViewOrders")}
        </Link>
      </div>
      {msg ? <p className="text-sm font-semibold text-[#9a4a2a]">{msg}</p> : null}
    </div>
  );
}
