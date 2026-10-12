"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { formatDateTime } from "@deepmatch/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

type Booking = {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  created_at: string;
};

export function BookingsClient() {
  const t = useT();
  const { locale } = useI18n();
  const statusLabel: Record<string, string> = {
    requested: t("booking.statusRequested"),
    assigned: t("booking.statusAssigned"),
    completed: t("booking.statusCompleted"),
    cancelled: t("booking.statusCancelled"),
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/services/bookings");
    if (res.status === 401) {
      setError(t("booking.needAuth"));
      setLoading(false);
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(resolveApiErrorMessage(body, t, "booking.loadError"));
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { data?: { bookings?: Booking[] } };
    setBookings(json.data?.bookings ?? []);
    setError(null);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel(id: string) {
    const res = await fetch("/api/v1/services/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    if (res.ok) void load();
  }

  if (loading) return <LoadingState label={t("booking.loading")} />;

  if (error) {
    return (
      <EmptyState
        title={t("booking.errorTitle")}
        description={error}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        title={t("booking.emptyTitle")}
        description={t("booking.emptyBody")}
        action={
          <Link href="/services">
            <Button type="button">{t("booking.viewServices")}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="mt-8 grid gap-3">
      {bookings.map((b) => (
        <li key={b.id}>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-dm-raspberry">
                {b.title ?? t("booking.serviceDefault")}
              </h2>
              <Badge>{statusLabel[b.status] ?? b.status}</Badge>
            </div>
            {b.description && (
              <p className="mt-2 text-sm text-dm-muted">{b.description}</p>
            )}
            <p className="mt-2 text-xs text-dm-muted">
              {formatDateTime(b.created_at, locale)}
            </p>
            {b.status === "requested" || b.status === "assigned" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void cancel(b.id)}
              >
                {t("booking.cancelRequest")}
              </Button>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
