"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const layerIds = ["visited", "wishlist", "milestone"] as const;

export function CoupleAddClient({ coupleId }: { coupleId: string | null }) {
  const t = useT();
  const router = useRouter();
  const [layer, setLayer] = useState<(typeof layerIds)[number]>("visited");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const layers = [
    { id: "visited" as const, label: t("couple.layerVisited") },
    { id: "wishlist" as const, label: t("couple.layerWishlist") },
    { id: "milestone" as const, label: t("couple.layerMilestone") },
  ];

  if (!coupleId) {
    return (
      <EmptyState
        title={t("couple.addEmptyTitle")}
        description={t("couple.addEmptyBody")}
        action={
          <Link href="/couple/invite">
            <Button type="button">{t("couple.invite")}</Button>
          </Link>
        }
      />
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("place") ?? "").trim();
    const note = String(fd.get("story") ?? "").trim();
    const privateNote = String(fd.get("private_note") ?? "").trim();
    const occurred_on = String(fd.get("visited_on") ?? "").trim() || undefined;
    if (!title) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/couples/${coupleId}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          layer,
          note: note || undefined,
          occurred_on,
          location: { name: title },
        }),
      });
      const json = (await res.json()) as {
        error?: { message?: string };
        data?: { pin?: { id: string } };
      };
      if (!res.ok) {
        setMessage(resolveApiErrorMessage(json, t, "couple.addPinFailed"));
        return;
      }

      const pinId = json.data?.pin?.id;
      if (pinId && privateNote) {
        const jRes = await fetch(`/api/v1/couples/${coupleId}/journals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pin_id: pinId,
            body: privateNote,
            shared_with_partner: false,
          }),
        });
        if (!jRes.ok) {
          setMessage(t("couple.pinJournalPartial"));
          return;
        }
      }

      setMessage(t("couple.pinSaved"));
      router.push("/couple/map");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-dm-raspberry">
            {t("couple.layerLegend")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {layers.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayer(l.id)}
                className="rounded-full"
              >
                <Badge tone={layer === l.id ? "good" : "default"}>{l.label}</Badge>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("couple.placeTitle")}
          <Input name="place" required className="mt-1" />
        </label>
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("couple.visitedOn")}
          <Input name="visited_on" type="date" className="mt-1" />
        </label>
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("couple.storyLabel")}
          <Textarea name="story" rows={3} className="mt-1" />
        </label>
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("couple.privateFeel")}
          <Textarea name="private_note" rows={2} className="mt-1" />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? t("couple.savingPin") : t("couple.savePin")}
          </Button>
          <Link href="/couple/map">
            <Button type="button" variant="outline">
              {t("couple.backToMap")}
            </Button>
          </Link>
        </div>
        {message ? (
          <p className="text-sm text-dm-muted" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
