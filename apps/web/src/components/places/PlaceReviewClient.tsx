"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import {
  confirmMedia,
  uploadWithIntent,
  type UploadIntentResponse,
} from "@/lib/media/client-upload";

export function PlaceReviewClient({ placeId }: { placeId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    const text = body.trim();
    if (!text) {
      setNote(t("places.reviewBodyRequired"));
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      let mediaId: string | null = null;
      if (file) {
        const allowed = new Set([
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/webm",
        ]);
        if (!allowed.has(file.type)) {
          setNote(t("places.reviewMediaTypeError"));
          return;
        }
        const intentRes = await fetch("/api/v1/media/upload-intents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: file.type,
            bytes: file.size,
            place_id: placeId,
            purpose: "place_review",
          }),
        });
        const intent = (await intentRes.json()) as {
          error?: { message?: string };
          data?: UploadIntentResponse;
        };
        if (!intentRes.ok || !intent.data) {
          setNote(resolveApiErrorMessage(intent, t, "places.reviewFailed"));
          return;
        }
        const supabase = createClient();
        const up = await uploadWithIntent(
          intent.data,
          file,
          async ({ path, token, file: f, contentType }) => {
            const { error } = await supabase.storage
              .from("media")
              .uploadToSignedUrl(path, token, f, { contentType });
            return { error: error ? new Error(error.message) : null };
          },
        );
        if (up.error) {
          setNote(up.error);
          return;
        }
        const confirmed = await confirmMedia(intent.data.media_id);
        if (!confirmed.ok) {
          setNote(confirmed.error ?? t("places.reviewFailed"));
          return;
        }
        mediaId = intent.data.media_id;
      }

      const res = await fetch(`/api/v1/places/${placeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body: text, media_id: mediaId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(resolveApiErrorMessage(json, t, "places.reviewFailed"));
        return;
      }
      setNote(t("places.reviewSaved"));
      setBody("");
      setFile(null);
      setOpen(false);
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" className="sm:flex-1" onClick={() => setOpen(true)}>
        {t("places.writeReviewCta")}
      </Button>
    );
  }

  return (
    <Card className="space-y-3 text-sm sm:flex-1">
      <p className="font-semibold text-dm-ink">{t("places.writeReviewCta")}</p>
      <label className="block">
        <span className="text-xs text-dm-muted">{t("places.reviewRating")}</span>
        <select
          className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}/5
            </option>
          ))}
        </select>
      </label>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={t("places.reviewBodyPh")}
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        disabled={busy}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? t("common.loading") : t("places.reviewSubmit")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => setOpen(false)}
        >
          {t("common.cancel")}
        </Button>
      </div>
      {note ? (
        <p className="text-dm-muted" role="status">
          {note}
        </p>
      ) : null}
    </Card>
  );
}
