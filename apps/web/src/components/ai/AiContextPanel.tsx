"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

type Usage = {
  used: number;
  quota: number;
  remaining: number;
  circuitOpen: boolean;
  adapter: string;
};

type ProfileSnippet = {
  completeness: number | null;
  intent: string | null;
};

export function AiContextPanel() {
  const t = useT();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [profile, setProfile] = useState<ProfileSnippet>({
    completeness: null,
    intent: null,
  });
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void fetch("/api/v1/ai/usage")
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) {
          setUsage({
            used: j.used,
            quota: j.quota,
            remaining: j.remaining,
            circuitOpen: j.circuitOpen,
            adapter: j.adapter,
          });
        } else {
          setLoadError(true);
        }
      })
      .catch(() => setLoadError(true));

    // Best-effort profile completeness from existing me API if available
    void fetch("/api/v1/me/profile")
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((j) => {
        if (!j) return;
        const src = j.profile ?? j;
        const completeness =
          typeof src.profile_completeness === "number"
            ? src.profile_completeness
            : typeof src.completeness === "number"
              ? src.completeness
              : null;
        const intent =
          typeof src.relationship_intent === "string"
            ? src.relationship_intent
            : typeof src.intent === "string"
              ? src.intent
              : null;
        setProfile({ completeness, intent });
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-dm-muted">
          {t("ai.contextQuota")}
        </p>
        {usage ? (
          <p className="mt-1 font-display text-2xl font-semibold text-dm-ink">
            {usage.used}/{usage.quota}
          </p>
        ) : loadError ? (
          <p className="mt-1 text-dm-muted">{t("ai.contextUnavailable")}</p>
        ) : (
          <p className="mt-1 text-dm-muted">{t("ai.loading")}</p>
        )}
        {usage ? (
          <p className="mt-1 text-xs text-dm-muted">
            {t("ai.contextRemaining", { n: usage.remaining })}
            {usage.circuitOpen ? ` · ${t("ai.circuitOpen")}` : ""}
            {` · ${usage.adapter}`}
          </p>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-dm-muted">
          {t("ai.contextProfile")}
        </p>
        {profile.completeness != null ? (
          <p className="mt-1 font-semibold text-dm-ink">
            {Math.round(profile.completeness)}%
          </p>
        ) : (
          <p className="mt-1 text-xs text-dm-muted">{t("ai.contextProfilePending")}</p>
        )}
        {profile.intent ? (
          <p className="mt-1 text-xs text-dm-ink">{profile.intent}</p>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-dm-muted">
          {t("ai.contextConsent")}
        </p>
        <p className="mt-1 text-xs text-dm-muted">{t("ai.contextConsentHint")}</p>
        <Link href="/me/privacy" className="mt-2 inline-flex">
          <Button type="button" size="sm" variant="outline">
            {t("ai.managePrivacy")}
          </Button>
        </Link>
      </div>

      <div className="rounded-xl bg-dm-blush/60 p-3 text-xs text-dm-ink">
        {t("ai.contextDisclaimer")}
      </div>
    </div>
  );
}
