"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function CoupleInvitePage() {
  const t = useT();
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createInvite(withEmail: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/couple-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withEmail ? { email: email.trim() } : {}),
      });
      const json = (await res.json()) as {
        error?: string | { message?: string };
        code?: string;
        expires_at?: string;
        inviteUrl?: string;
        emailOk?: boolean | null;
        emailDelivery?: string;
      };
      if (!res.ok) {
        setMessage(
          typeof json.error === "string"
            ? json.error
            : (json.error?.message ?? t("couple.createFailed")),
        );
        return;
      }
      setCode(json.code ?? null);
      setInviteUrl(json.inviteUrl ?? null);
      if (withEmail) {
        if (json.emailOk === false) {
          setMessage(t("couple.emailSendFailed"));
        } else if (json.emailDelivery === "stub") {
          setMessage(t("couple.emailStubSent"));
        } else {
          setMessage(t("couple.emailSent"));
        }
      } else if (json.expires_at) {
        setMessage(t("couple.codeExpires", { when: json.expires_at }));
      } else {
        setMessage(t("couple.createdCode"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function acceptInvite() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/couple-invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: acceptCode }),
      });
      const json = (await res.json()) as {
        error?: string | { message?: string };
        pairId?: string;
      };
      if (!res.ok) {
        setMessage(
          typeof json.error === "string"
            ? json.error
            : (json.error?.message ?? t("couple.acceptFailed")),
        );
        return;
      }
      setMessage(t("couple.acceptedSpace"));
      router.push("/couple/map");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage(t("couple.linkCopied"));
    } catch {
      setMessage(inviteUrl);
    }
  }

  return (
    <div className="dm-page-frame dm-page-frame--narrow">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("couple.inviteHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("couple.inviteIntro")}</p>

      <Card className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("couple.inviteByEmail")}
        </h2>
        <p className="text-xs text-dm-muted">{t("couple.inviteByEmailHint")}</p>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("couple.inviteEmailPlaceholder")}
          aria-label={t("couple.inviteEmailPlaceholder")}
          autoComplete="email"
        />
        <Button
          type="button"
          onClick={() => void createInvite(true)}
          disabled={busy || !email.trim()}
        >
          {t("couple.sendInviteEmail")}
        </Button>
      </Card>

      <Card className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("couple.createInvite")}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => void createInvite(false)}
          disabled={busy}
        >
          {t("couple.createCode")}
        </Button>
        {code ? (
          <p className="break-all rounded-dm bg-dm-surface p-3 text-sm">
            {t("couple.codeOnce")} <strong>{code}</strong>
          </p>
        ) : null}
        {inviteUrl ? (
          <div className="space-y-2">
            <p className="break-all rounded-dm bg-dm-surface p-3 text-xs text-dm-muted">
              {inviteUrl}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => void copyLink()}>
              {t("couple.copyLink")}
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold text-dm-raspberry">
          {t("couple.acceptInvite")}
        </h2>
        <Input
          value={acceptCode}
          onChange={(e) => setAcceptCode(e.target.value)}
          placeholder={t("couple.acceptCodeLabel")}
          aria-label={t("couple.acceptCodeLabel")}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void acceptInvite()}
          disabled={busy || !acceptCode.trim()}
        >
          {t("couple.acceptInvite")}
        </Button>
      </Card>

      {message ? (
        <p className="mt-4 text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
