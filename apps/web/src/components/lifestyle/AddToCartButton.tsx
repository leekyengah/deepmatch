"use client";

import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { addDemoCartLine } from "@/lib/demo-cart";

export function AddToCartButton(props: {
  productId: string;
  mockId: string;
  title: string;
  category: string;
  priceVnd: number;
}) {
  const t = useT();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          addDemoCartLine({
            productId: props.productId,
            mockId: props.mockId,
            title: props.title,
            category: props.category,
            priceVnd: props.priceVnd,
          });
          setMsg(t("commerce.cartAdded"));
        }}
      >
        {t("commerce.cartAdd")}
      </Button>
      {msg ? <p className="text-xs font-semibold text-[#9a4a2a]">{msg}</p> : null}
    </div>
  );
}
