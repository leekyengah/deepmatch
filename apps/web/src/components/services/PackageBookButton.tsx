"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PackageBookButton({
  packageCode,
  slug,
}: {
  packageCode: string;
  slug: string;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function book() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/v1/services/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_code: packageCode, package_slug: slug }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "booking.bookRequestFailed"));
      return;
    }
    setOk(true);
    setMessage(t("booking.bookRequestSent"));
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={busy} onClick={() => void book()}>
        {busy ? t("booking.sending") : t("booking.requestSandbox")}
      </Button>
      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}{" "}
          {ok ? (
            <Link href="/bookings" className="underline">
              {t("booking.viewBookings")}
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
