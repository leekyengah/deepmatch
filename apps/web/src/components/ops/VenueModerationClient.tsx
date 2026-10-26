"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Venue = {
  id: string;
  name: string;
  city: string;
  closed: boolean;
  review_count: number;
};
type QueueItem = {
  id: string;
  place_id: string;
  review_id: string;
  status: string;
  reason: string | null;
};

export function VenueModerationClient() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/admin/venues");
    const json = (await res.json()) as {
      data?: { venues?: Venue[]; queue?: QueueItem[] };
      error?: { message?: string };
    };
    if (!res.ok) {
      setErr(json.error?.message ?? `HTTP ${res.status}`);
      return;
    }
    setVenues(json.data?.venues ?? []);
    setQueue(json.data?.queue ?? []);
    setErr(null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/venues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErr(json?.error?.message ?? `HTTP ${res.status}`);
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {err ? <p className="text-sm text-red-700">{err}</p> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-dm-champagne">
          Moderation queue
        </h2>
        {!queue.length ? (
          <Card className="p-4 text-sm text-dm-muted">Queue empty</Card>
        ) : (
          queue.map((q) => (
            <Card key={q.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-sm">
                <p className="font-medium text-dm-ink">
                  {q.place_id} · {q.review_id}
                </p>
                <p className="text-dm-muted">{q.reason ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={q.status === "open" ? "warn" : "default"}>
                  {q.status}
                </Badge>
                {q.status === "open" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void patch({
                          queue_id: q.id,
                          queue_action: "removed",
                        })
                      }
                    >
                      Remove
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void patch({
                          queue_id: q.id,
                          queue_action: "dismissed",
                        })
                      }
                    >
                      Dismiss
                    </Button>
                  </>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-dm-champagne">
          Venues (editorial sample)
        </h2>
        {venues.map((v) => (
          <Card
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="text-sm">
              <p className="font-medium text-dm-ink">{v.name}</p>
              <p className="text-dm-muted">
                {v.city} · {v.review_count} reviews · {v.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={v.closed ? "warn" : "good"}>
                {v.closed ? "closed" : "open"}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void patch({ place_id: v.id, closed: !v.closed })
                }
              >
                {v.closed ? "Reopen" : "Flag closed"}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
