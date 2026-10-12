"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DemoBookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "confirm" | "cancel") {
    setBusy(true);
    try {
      await fetch("/api/v1/catalog/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "CANCELLED") {
    return <p className="mt-2 text-xs text-dm-muted">Đã hủy</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {status !== "DEMO_CONFIRMED" ? (
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void act("confirm")}
        >
          Xác nhận DEMO
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={() => void act("cancel")}
      >
        Hủy
      </Button>
    </div>
  );
}
