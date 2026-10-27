"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import {
  confirmMedia,
  uploadWithIntent,
  type UploadIntentResponse,
} from "@/lib/media/client-upload";
import { createClient } from "@/lib/supabase/client";
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
  const [file, setFile] = useState<File | null>(null);

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

  async function uploadCoupleMedia(pairId: string, mediaFile: File) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(mediaFile.type)) {
      return t("couple.addMediaTypeError");
    }
    if (mediaFile.size > 10 * 1024 * 1024) {
      return t("couple.addMediaSizeError");
    }
    const intentRes = await fetch("/api/v1/media/upload-intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_type: mediaFile.type,
        bytes: mediaFile.size,
        pair_id: pairId,
        purpose: "couple",
      }),
    });
    const intent = (await intentRes.json()) as {
      error?: { message?: string };
      data?: UploadIntentResponse;
    };
    if (!intentRes.ok || !intent.data) {
      return resolveApiErrorMessage(intent, t, "couple.addMediaIntentFailed");
    }
    const supabase = createClient();
    const up = await uploadWithIntent(
      intent.data,
      mediaFile,
      async ({ path, token, file: f, contentType }) => {
        const { error } = await supabase.storage
          .from("media")
          .uploadToSignedUrl(path, token, f, { contentType });
        return { error: error ? new Error(error.message) : null };
      },
    );
    if (up.error) {
      return up.error === "upload_unavailable"
        ? t("couple.addMediaUnavailable")
        : up.error;
    }
    const confirmed = await confirmMedia(intent.data.media_id);
    if (!confirmed.ok) {
      return confirmed.error ?? t("couple.addMediaIntentFailed");
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("place") ?? "").trim();
    const note = String(fd.get("story") ?? "").trim();
    const privateNote = String(fd.get("private_note") ?? "").trim();
    const occurred_on = String(fd.get("visited_on") ?? "").trim() || undefined;
    if (!title) return;

    if (!coupleId) return;
    const pairId = coupleId;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/couples/${pairId}/pins`, {
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
        const jRes = await fetch(`/api/v1/couples/${pairId}/journals`, {
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

      if (file) {
        const mediaErr = await uploadCoupleMedia(pairId, file);
        if (mediaErr) {
          setMessage(`${t("couple.pinSaved")} ${mediaErr}`);
          router.push("/couple/map");
          router.refresh();
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
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("couple.addMediaLabel")}
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1"
            onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
          />
          <span className="mt-1 block text-xs font-normal text-dm-muted">
            {t("couple.addMediaHint")}
          </span>
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
