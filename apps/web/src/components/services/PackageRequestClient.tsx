"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  confirmMedia,
  uploadWithIntent,
  type UploadIntentResponse,
} from "@/lib/media/client-upload";

const NEED_KEYS = [
  "needListen",
  "needCompany",
  "needGoals",
  "needMatch",
  "needOther",
] as const;

export function PackageRequestClient({
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
  const [needs, setNeeds] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [useNeedsProfile, setUseNeedsProfile] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function toggleNeed(key: string) {
    setNeeds((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setMessage(t("booking.intakeConsentRequired"));
      return;
    }
    setBusy(true);
    setMessage(null);
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
          setMessage(t("booking.intakeMediaTypeError"));
          return;
        }
        const intentRes = await fetch("/api/v1/media/upload-intents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: file.type,
            bytes: file.size,
            service_id: packageCode,
            purpose: "service",
          }),
        });
        const intent = (await intentRes.json()) as {
          error?: { message?: string };
          data?: UploadIntentResponse;
        };
        if (!intentRes.ok || !intent.data) {
          setMessage(
            resolveApiErrorMessage(intent, t, "booking.bookRequestFailed"),
          );
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
          setMessage(up.error);
          return;
        }
        const confirmed = await confirmMedia(intent.data.media_id);
        if (!confirmed.ok) {
          setMessage(confirmed.error ?? t("booking.bookRequestFailed"));
          return;
        }
        mediaId = intent.data.media_id;
      }

      const intake = {
        needs: needs.map((k) => t(`booking.${k}`)),
        region: region.trim().slice(0, 120),
        schedule: schedule.trim().slice(0, 200),
        note: note.trim().slice(0, 400),
        use_needs_profile: useNeedsProfile,
        consent_version: "companion-intake-v1",
      };
      const res = await fetch("/api/v1/services/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_code: packageCode,
          package_slug: slug,
          note: JSON.stringify(intake).slice(0, 500),
          media_id: mediaId,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage(resolveApiErrorMessage(body, t, "booking.bookRequestFailed"));
        return;
      }
      setOk(true);
      setMessage(t("booking.bookRequestSent"));
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <Card className="space-y-3 text-sm">
        <p role="status">{message}</p>
        <Link href="/bookings" className="underline text-dm-primary">
          {t("booking.viewBookings")}
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-5">
      <Card className="space-y-3 text-sm">
        <fieldset>
          <legend className="font-semibold text-dm-ink">
            {t("booking.intakeNeeds")}
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {NEED_KEYS.map((key) => (
              <label key={key} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={needs.includes(key)}
                  onChange={() => toggleNeed(key)}
                />
                <span>{t(`booking.${key}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="font-semibold text-dm-ink">
            {t("booking.intakeRegion")}
          </span>
          <Input
            className="mt-1"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder={t("booking.intakeRegionPh")}
          />
        </label>

        <label className="block">
          <span className="font-semibold text-dm-ink">
            {t("booking.intakeSchedule")}
          </span>
          <Input
            className="mt-1"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder={t("booking.intakeSchedulePh")}
          />
        </label>

        <label className="block">
          <span className="font-semibold text-dm-ink">
            {t("booking.intakeNote")}
          </span>
          <textarea
            className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-sm"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("booking.intakeNotePh")}
          />
        </label>

        <label className="block">
          <span className="font-semibold text-dm-ink">
            {t("booking.intakeMedia")}
          </span>
          <p className="mt-1 text-xs text-dm-muted">{t("booking.intakeMediaHint")}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            disabled={busy}
            className="mt-2 block w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={useNeedsProfile}
            onChange={(e) => setUseNeedsProfile(e.target.checked)}
          />
          <span>{t("booking.intakeUseNeeds")}</span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>{t("booking.intakeConsent")}</span>
        </label>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy || !consent}>
          {busy ? t("booking.sending") : t("booking.submitIntake")}
        </Button>
        <Link href={`/services/${slug}`}>
          <Button type="button" variant="outline">
            {t("common.back")}
          </Button>
        </Link>
      </div>
      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
