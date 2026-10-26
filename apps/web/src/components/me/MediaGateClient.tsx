"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  confirmMedia,
  uploadWithIntent,
  type UploadIntentResponse,
} from "@/lib/media/client-upload";

type Gate = {
  discover_eligible: boolean;
  reasons: string[];
};

export function MediaGateClient() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    images: 0,
    videos: 0,
    approved_or_pending: 0,
  });
  const [gate, setGate] = useState<Gate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/media/library");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = (await res.json()) as {
      data?: {
        counts?: {
          images: number;
          videos: number;
          approved_or_pending: number;
        };
        gate?: Gate;
      };
    };
    setCounts(
      json.data?.counts ?? { images: 0, videos: 0, approved_or_pending: 0 },
    );
    setGate(json.data?.gate ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
      ]);
      if (!allowed.has(file.type)) {
        setNote(t("profile.avatarTypeError"));
        return;
      }
      const isVideo = file.type.startsWith("video/");
      const max = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > max) {
        setNote(
          isVideo ? t("chat.mediaVideoMax") : t("profile.avatarSizeError"),
        );
        return;
      }
      const intentRes = await fetch("/api/v1/media/upload-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: file.type,
          bytes: file.size,
          purpose: "profile",
        }),
      });
      const intent = (await intentRes.json()) as {
        error?: { message?: string };
        data?: UploadIntentResponse;
      };
      if (!intentRes.ok || !intent.data) {
        setNote(resolveApiErrorMessage(intent, t, "profile.avatarIntentFailed"));
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
        setNote(confirmed.error ?? t("profile.avatarIntentFailed"));
        return;
      }
      setNote(t("profile.avatarDone"));
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label={t("common.loading")} />;

  const reasonLabel: Record<string, string> = {
    need_min_3_images: t("profile.mediaGateNeedMin"),
    over_max_10_images: t("profile.mediaGateOverMax"),
    over_max_2_videos: t("profile.mediaGateOverVideos"),
  };

  return (
    <Card className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>
          {t("profile.mediaGateImages")}: {counts.images}
        </Badge>
        <Badge>
          {t("profile.mediaGateVideos")}: {counts.videos}
        </Badge>
        <Badge tone={gate?.discover_eligible ? "good" : "warn"}>
          {gate?.discover_eligible
            ? t("profile.mediaGateEligible")
            : t("profile.mediaGateBlocked")}
        </Badge>
      </div>
      <p className="text-dm-muted">{t("profile.mediaGateRule")}</p>
      {gate?.reasons?.length ? (
        <ul className="list-disc pl-5 text-dm-muted">
          {gate.reasons.map((r) => (
            <li key={r}>{reasonLabel[r] ?? r}</li>
          ))}
        </ul>
      ) : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        disabled={busy}
        className="block w-full text-sm"
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        aria-label={t("profile.mediaGateUploadCta")}
      />
      {busy ? (
        <Button type="button" size="sm" disabled>
          {t("profile.uploading")}
        </Button>
      ) : null}
      {note ? (
        <p className="text-sm text-dm-muted" role="status">
          {note}
        </p>
      ) : null}
      <Link href="/me/edit">
        <Button type="button" size="sm" variant="outline">
          {t("profile.avatarTitle")}
        </Button>
      </Link>
    </Card>
  );
}
