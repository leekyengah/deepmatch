"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

export function CoupleUsClient({
  coupleId,
  initial,
}: {
  coupleId: string | null;
  initial?: {
    space_title: string | null;
    motto: string | null;
    started_on: string | null;
  };
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [spaceTitle, setSpaceTitle] = useState(initial?.space_title ?? "");
  const [motto, setMotto] = useState(initial?.motto ?? "");
  const [startedOn, setStartedOn] = useState(initial?.started_on ?? "");

  if (!coupleId) {
    return (
      <EmptyState
        title={t("couple.usEmptyTitle")}
        description={t("couple.usEmptyBody")}
        action={
          <Link href="/couple/invite">
            <Button type="button" size="sm">
              {t("couple.invite")}
            </Button>
          </Link>
        }
      />
    );
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/v1/couples/${coupleId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space_title: spaceTitle || null,
          motto: motto || null,
          started_on: startedOn || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(resolveApiErrorMessage(json, t, "couple.settingsFailed"));
        return;
      }
      setNote(t("couple.settingsSaved"));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/v1/couples/${coupleId}/disconnect`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        setNote(resolveApiErrorMessage(json, t, "couple.disconnectFailed"));
        setOpen(false);
        return;
      }
      setOpen(false);
      setNote(t("couple.disconnected"));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card className="mb-4">
        <h2 className="font-display text-xl font-semibold text-dm-ink">
          {t("couple.usSettingsHeading")}
        </h2>
        <p className="mt-1 text-sm text-dm-muted">{t("couple.usSettingsHint")}</p>
        <form onSubmit={(e) => void saveSettings(e)} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-dm-ink">{t("couple.spaceTitleLabel")}</span>
            <input
              value={spaceTitle}
              onChange={(e) => setSpaceTitle(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
              placeholder={t("couple.spaceTitlePh")}
              maxLength={80}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-dm-ink">{t("couple.startedOnLabel")}</span>
            <input
              type="date"
              value={startedOn}
              onChange={(e) => setStartedOn(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-dm-ink">{t("couple.mottoLabel")}</span>
            <textarea
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
              rows={2}
              maxLength={200}
              placeholder={t("couple.mottoPh")}
            />
          </label>
          <p className="text-xs text-dm-muted">{t("couple.coverHint")}</p>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? t("common.loading") : t("couple.saveSettings")}
          </Button>
        </form>
      </Card>

      <Card className="mb-4">
        <a href={`/api/v1/couples/${coupleId}/export`} className="inline-block">
          <Button type="button" size="sm" variant="outline">
            {t("couple.exportMemories")}
          </Button>
        </a>
        <p className="mt-2 text-xs text-dm-muted">{t("couple.exportHint")}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-dm-ink">
          {t("couple.disconnectTitle")}
        </h2>
        <p className="mt-2 text-sm text-dm-muted">{t("couple.disconnectHint")}</p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="mt-4"
          onClick={() => setOpen(true)}
        >
          {t("couple.disconnect")}
        </Button>
      </Card>

      <Modal
        open={open}
        title={t("couple.disconnectModalTitle")}
        onClose={() => setOpen(false)}
      >
        <p className="text-sm text-dm-muted">{t("couple.disconnectModalBody")}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => void disconnect()}
            disabled={busy}
          >
            {busy
              ? t("couple.disconnecting")
              : t("couple.disconnectConfirmAction")}
          </Button>
        </div>
      </Modal>

      {note ? (
        <p className="mt-4 text-sm text-dm-muted" role="status">
          {note}
        </p>
      ) : null}
    </>
  );
}
