"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type DateRow = {
  id: string;
  title: string;
  starts_at: string;
  place_label: string | null;
  status: string;
};

export function CouplePlansClient({
  coupleId,
  initialDates,
}: {
  coupleId: string;
  initialDates: DateRow[];
}) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [place, setPlace] = useState("");

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/v1/couples/${coupleId}/dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          starts_at: when ? new Date(when).toISOString() : "",
          place_label: place || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(resolveApiErrorMessage(json, t, "couple.dateCreateFailed"));
        return;
      }
      setTitle("");
      setWhen("");
      setPlace("");
      setMsg(t("couple.dateCreated"));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-xl font-semibold text-dm-ink">
          {t("couple.proposeDateHeading")}
        </h2>
        <p className="mt-1 text-sm text-dm-muted">{t("couple.proposeDateHint")}</p>
        <form onSubmit={(e) => void propose(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-dm-ink">{t("couple.dateTitleLabel")}</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
              placeholder={t("couple.dateTitlePh")}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-dm-ink">{t("couple.dateWhenLabel")}</span>
            <input
              required
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-dm-ink">{t("couple.placeLabel")}</span>
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
              placeholder={t("couple.pinPlacePh")}
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? t("common.loading") : t("couple.proposeDateCta")}
            </Button>
          </div>
        </form>
        {msg ? (
          <p className="mt-3 text-sm text-dm-muted" role="status">
            {msg}
          </p>
        ) : null}
      </Card>

      <ul className="space-y-3">
        {initialDates.map((d) => (
          <li key={d.id}>
            <Card className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-dm-ink">{d.title}</p>
                <p className="mt-1 text-sm text-dm-muted">
                  {new Date(d.starts_at).toLocaleString("vi-VN")}
                  {d.place_label ? ` · ${d.place_label}` : ""}
                </p>
              </div>
              <Badge tone={d.status === "confirmed" ? "good" : "warn"}>
                {d.status === "confirmed"
                  ? t("couple.dateConfirmed")
                  : t("couple.dateProposed")}
              </Badge>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
