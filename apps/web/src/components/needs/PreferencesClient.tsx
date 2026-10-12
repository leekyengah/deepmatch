"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

type Pref = { desire: string; weight: number; hard: boolean };

const ROWS = [
  { id: "C05", labelKey: "needs.prefC05" },
  { id: "C06", labelKey: "needs.prefC06" },
  { id: "C01", labelKey: "needs.prefC01" },
] as const;

export function PreferencesClient() {
  const t = useT();
  const [self, setSelf] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState<Record<string, Pref>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/needs/preferences");
    if (!res.ok) {
      setMessage(t("needs.loadError"));
      setLoading(false);
      return;
    }
    const json = (await res.json()) as {
      data?: {
        self?: Record<string, string>;
        preferences?: Record<string, Pref>;
        consent_at?: string | null;
      };
    };
    setSelf(json.data?.self ?? {});
    setPrefs(json.data?.preferences ?? {});
    setConsent(Boolean(json.data?.consent_at));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function patch(id: string, next: Partial<Pref>) {
    setPrefs((prev) => ({
      ...prev,
      [id]: {
        desire: prev[id]?.desire ?? "",
        weight: prev[id]?.weight ?? 0,
        hard: prev[id]?.hard ?? false,
        ...next,
      },
    }));
  }

  async function save() {
    if (!consent) {
      setMessage(t("needs.consentRequired"));
      return;
    }
    setSaving(true);
    const res = await fetch("/api/v1/needs/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: prefs, consent: true }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "needs.saveError"));
      return;
    }
    setMessage(t("needs.saved"));
  }

  if (loading) return <LoadingState label={t("needs.loading")} />;

  return (
    <div className="space-y-5">
      <Card className="space-y-2 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>{t("needs.consentLabel")}</span>
        </label>
        <p className="text-xs text-dm-muted">{t("needs.prefNote")}</p>
      </Card>

      {ROWS.map(({ id, labelKey }) => {
        const p = prefs[id] ?? { desire: "", weight: 0, hard: false };
        return (
          <Card key={id} className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{id}</Badge>
              <span className="font-semibold text-dm-ink">{t(labelKey)}</span>
            </div>
            <p className="text-xs text-dm-muted">
              {t("needs.prefSelf")}: {self[id]?.trim() || t("needs.prefSelfEmpty")}
            </p>
            <label className="block">
              <span className="font-medium">{t("needs.prefDesire")}</span>
              <input
                className="mt-1 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2"
                value={p.desire}
                onChange={(e) => patch(id, { desire: e.target.value })}
                placeholder={t("needs.prefDesirePh")}
              />
            </label>
            <label className="flex items-center gap-3">
              <span className="font-medium">{t("needs.prefWeight")}</span>
              <input
                type="range"
                min={0}
                max={3}
                value={p.weight}
                onChange={(e) => patch(id, { weight: Number(e.target.value) })}
              />
              <Badge>{p.weight}</Badge>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={p.hard}
                onChange={(e) => patch(id, { hard: e.target.checked })}
              />
              <span>{t("needs.prefHard")}</span>
            </label>
          </Card>
        );
      })}

      <Button type="button" disabled={saving || !consent} onClick={() => void save()}>
        {saving ? t("common.loading") : t("needs.prefSave")}
      </Button>
      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
