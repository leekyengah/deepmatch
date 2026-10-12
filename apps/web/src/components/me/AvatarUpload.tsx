"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export function AvatarUpload({
  currentPath,
}: {
  currentPath: string | null;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setNote(t("profile.avatarTypeError"));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setNote(t("profile.avatarSizeError"));
        return;
      }

      const intentRes = await fetch("/api/v1/media/upload-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: file.type,
          bytes: file.size,
        }),
      });
      const intent = (await intentRes.json()) as {
        error?: { message?: string };
        data?: {
          media_id: string;
          storage_path: string;
          upload?: { path: string; token: string } | null;
          note?: string;
        };
      };
      if (!intentRes.ok || !intent.data) {
        setNote(resolveApiErrorMessage(intent, t, "profile.avatarIntentFailed"));
        return;
      }
      if (!intent.data.upload) {
        setNote(intent.data.note ?? t("profile.avatarStorageNotReady"));
        return;
      }

      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(
          intent.data.upload.path,
          intent.data.upload.token,
          file,
          { contentType: file.type },
        );
      if (upErr) {
        setNote(upErr.message);
        return;
      }

      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          avatar_path: intent.data.storage_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
      if (pErr) {
        setNote(t("profile.avatarProfilePartial", { error: pErr.message }));
        return;
      }

      setPreview(URL.createObjectURL(file));
      setNote(t("profile.avatarDone"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-[#efcfda] bg-white/60 p-4">
      <p className="text-sm font-semibold text-[var(--dm-deep)]">
        {t("profile.avatarTitle")}
      </p>
      <p className="text-xs text-dm-muted">{t("profile.avatarHint")}</p>
      {(preview || currentPath) && (
        <p className="text-xs text-dm-muted">
          {preview
            ? t("profile.avatarPreview")
            : t("profile.avatarPath", { path: currentPath ?? "" })}
        </p>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
        aria-label={t("profile.choosePhoto")}
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
    </div>
  );
}
