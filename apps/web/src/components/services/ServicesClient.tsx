"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

type Offering = {
  id: string;
  title: string;
  description: string | null;
};

export function ServicesClient() {
  const t = useT();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/services/offerings");
    if (res.status === 401) {
      setError(t("booking.servicesNeedAuth"));
      setLoading(false);
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(resolveApiErrorMessage(body, t, "booking.servicesLoadError"));
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { data?: { offerings?: Offering[] } };
    setOfferings(json.data?.offerings ?? []);
    setError(null);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function book(offeringId: string) {
    setBookingId(offeringId);
    setMessage(null);
    const res = await fetch("/api/v1/services/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offering_id: offeringId }),
    });
    setBookingId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "booking.bookRequestFailed"));
      return;
    }
    setMessage(t("booking.bookRequestSent"));
  }

  if (loading) return <LoadingState label={t("booking.servicesLoading")} />;

  if (error) {
    return (
      <EmptyState
        title={t("booking.servicesErrorTitle")}
        description={error}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }

  if (offerings.length === 0) {
    return (
      <EmptyState
        title={t("booking.servicesEmptyTitle")}
        description={t("booking.servicesEmptyBody")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="text-sm text-dm-raspberry" role="status">
          {message}{" "}
          <Link href="/bookings" className="underline">
            {t("booking.viewBookings")}
          </Link>
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {offerings.map((s) => (
          <Card key={s.id}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-dm-raspberry">{s.title}</h2>
              <Badge>{t("booking.optional")}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-dm-muted">
              {s.description}
            </p>
            <Button
              type="button"
              className="mt-4"
              size="sm"
              disabled={bookingId === s.id}
              onClick={() => void book(s.id)}
            >
              {bookingId === s.id ? t("booking.sending") : t("booking.registerConsult")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
