"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

type NeedsQuestion = {
  id: string;
  group: string;
  promptVi: string;
  answerType: string;
};

export function NeedsRunnerClient() {
  const t = useT();
  const [questions, setQuestions] = useState<NeedsQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    const [qRes, aRes] = await Promise.all([
      fetch("/api/v1/needs/questions?limit=100"),
      fetch("/api/v1/needs/answers"),
    ]);
    if (!qRes.ok || !aRes.ok) {
      setMessage(t("needs.loadError"));
      setLoading(false);
      return;
    }
    const qJson = (await qRes.json()) as {
      data?: { questions?: NeedsQuestion[]; total?: number };
    };
    const aJson = (await aRes.json()) as {
      data?: { answers?: Record<string, string>; consent_at?: string | null };
    };
    setQuestions(qJson.data?.questions ?? []);
    setTotal(qJson.data?.total ?? 100);
    setAnswers(aJson.data?.answers ?? {});
    setConsent(Boolean(aJson.data?.consent_at));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = questions[idx];
  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[k]?.trim()).length,
    [answers],
  );

  async function save(next: Record<string, string>, withConsent = consent) {
    if (!withConsent) {
      setMessage(t("needs.consentRequired"));
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/v1/needs/answers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: next, consent: true, merge: true }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(resolveApiErrorMessage(body, t, "needs.saveError"));
      return;
    }
    const json = (await res.json()) as {
      data?: { answers?: Record<string, string> };
    };
    setAnswers(json.data?.answers ?? next);
    setConsent(true);
    setMessage(t("needs.saved"));
  }

  async function revoke() {
    setSaving(true);
    await fetch("/api/v1/needs/answers", { method: "DELETE" });
    setAnswers({});
    setConsent(false);
    setSaving(false);
    setMessage(t("needs.revoked"));
  }

  if (loading) return <LoadingState label={t("needs.loading")} />;
  if (!current) {
    return <p className="text-sm text-dm-muted">{t("needs.empty")}</p>;
  }

  const options = current.answerType
    .replace(/^MỘT:\s*/i, "")
    .replace(/^NHIỀU[^:]+:\s*/i, "")
    .split(/\s*\/\s*/)
    .map((s) => s.replace(/;.*$/, "").trim())
    .filter((s) => s && !/^MỞ/i.test(s) && !/^SỐ/i.test(s));

  const isOpen =
    /^MỞ/i.test(current.answerType) ||
    /^SỐ/i.test(current.answerType) ||
    options.length < 2;

  return (
    <div className="space-y-6">
      <Card className="space-y-3 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>{t("needs.consentLabel")}</span>
        </label>
        <p className="text-xs text-dm-muted">{t("needs.privacyNote")}</p>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          {answeredCount}/{total}
        </Badge>
        <Badge tone="default">
          {idx + 1}/{questions.length}
        </Badge>
        <Badge tone="good">{current.group}</Badge>
        <span className="text-xs text-dm-muted">{current.id}</span>
      </div>

      <Card>
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {current.promptVi}
        </h2>
        <p className="mt-2 text-xs text-dm-muted">{current.answerType}</p>

        {isOpen ? (
          <textarea
            className="mt-4 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-sm"
            rows={4}
            value={answers[current.id] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))
            }
            placeholder={t("needs.openPlaceholder")}
          />
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={
                  answers[current.id] === opt
                    ? "rounded-dm border border-dm-primary bg-dm-blush px-3 py-2 text-left text-sm font-semibold text-dm-primary"
                    : "rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-left text-sm text-dm-ink"
                }
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [current.id]: opt }))
                }
              >
                {opt}
              </button>
            ))}
            <button
              type="button"
              className="text-left text-xs text-dm-muted underline"
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.id]: t("needs.skipAnswer"),
                }))
              }
            >
              {t("needs.skipAnswer")}
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            {t("common.back")}
          </Button>
          <Button
            type="button"
            disabled={saving || !consent}
            onClick={() => void save(answers, true)}
          >
            {saving ? t("common.loading") : t("needs.saveProgress")}
          </Button>
          <Button
            type="button"
            disabled={idx >= questions.length - 1}
            onClick={() => {
              void save(answers, consent);
              setIdx((i) => Math.min(questions.length - 1, i + 1));
            }}
          >
            {t("common.next")}
          </Button>
        </div>
      </Card>

      {message ? (
        <p className="text-sm text-dm-muted" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={saving}
        onClick={() => void revoke()}
      >
        {t("needs.revoke")}
      </Button>
    </div>
  );
}
