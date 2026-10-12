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

export function CoupleUsClient({ coupleId }: { coupleId: string | null }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

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
        <p className="text-sm text-dm-raspberry">
          {t("couple.activePair")}{" "}
          <code className="text-xs">{coupleId}</code>
        </p>
        <a
          href={`/api/v1/couples/${coupleId}/export`}
          className="mt-3 inline-block"
        >
          <Button type="button" size="sm" variant="outline">
            {t("couple.exportMemories")}
          </Button>
        </a>
        <p className="mt-2 text-xs text-dm-muted">{t("couple.exportHint")}</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-dm-raspberry">
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
