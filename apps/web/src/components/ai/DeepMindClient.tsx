"use client";

import Link from "next/link";
import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useEffect, useState } from "react";
import {
  DEEPMIND_DISCLAIMER,
  DEEPMIND_QUESTIONS,
  type DeepMindQuestion,
} from "@deepmatch/shared";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DeepMindClient() {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [insight, setInsight] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/ai/deepmind");
      const json = await res.json();
      if (res.ok) {
        setAnswers(json.answers ?? {});
        setInsight(json.insight_draft ?? null);
      }
      setLoaded(true);
    })();
  }, []);

  const q: DeepMindQuestion | undefined = DEEPMIND_QUESTIONS[step];

  async function save(nextAnswers: Record<string, string>, draft?: string | null) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/deepmind", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: nextAnswers,
          insight_draft: draft === undefined ? insight : draft,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(resolveApiErrorMessage(json, t, "ai.saveFailed"));
        return;
      }
      setAnswers(json.answers ?? nextAnswers);
    } finally {
      setSaving(false);
    }
  }

  async function generateInsight() {
    if (!consent) {
      setError(t("ai.consentRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "deepmind",
          consent,
          input: { answers },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(resolveApiErrorMessage(json, t, "ai.insightFailed"));
        return;
      }
      const draft = (json.suggestions ?? [])
        .map((s: { title: string; body: string }) => `${s.title}: ${s.body}`)
        .join("\n\n");
      setInsight(draft);
      await save(answers, draft);
    } finally {
      setSaving(false);
    }
  }

  async function wipe() {
    if (!confirm(t("ai.clearConfirm"))) return;
    await fetch("/api/v1/ai/deepmind", { method: "DELETE" });
    setAnswers({});
    setInsight(null);
    setStep(0);
  }

  if (!loaded) {
    return <p className="text-sm text-dm-muted">{t("ai.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-dm-muted">{DEEPMIND_DISCLAIMER}</p>
      {q ? (
        <Card className="space-y-3 text-sm">
          <p className="text-xs font-bold text-dm-primary">
            {t("ai.questionN", { n: step + 1, total: DEEPMIND_QUESTIONS.length })}
          </p>
          <p className="font-semibold text-dm-raspberry">{q.prompt}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={
                  answers[q.id] === opt
                    ? "rounded-dm border border-dm-primary bg-[#FFE9F0] px-3 py-2 text-left text-dm-raspberry"
                    : "rounded-dm border border-dm-line bg-dm-panel px-3 py-2 text-left"
                }
                onClick={() => {
                  const next = { ...answers, [q.id]: opt };
                  setAnswers(next);
                  void save(next);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {t("ai.prev")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setStep((s) => Math.min(DEEPMIND_QUESTIONS.length - 1, s + 1))
              }
              disabled={step >= DEEPMIND_QUESTIONS.length - 1}
            >
              {t("ai.next")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!consent || saving || Object.keys(answers).length < 3}
              onClick={() => void generateInsight()}
            >
              {saving ? t("ai.creating") : t("ai.makeCard")}
            </Button>
          </div>
          <label className="flex items-start gap-2 text-sm text-dm-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              {t("ai.consentText")}{" "}
              <Link href="/legal/ai" className="underline" target="_blank">
                {t("ai.policyLink")}
              </Link>
            </span>
          </label>
        </Card>
      ) : null}

      {insight ? (
        <Card className="whitespace-pre-wrap text-sm text-dm-ink">
          <p className="font-semibold text-dm-raspberry">{t("ai.cardTitle")}</p>
          <textarea
            className="mt-2 w-full rounded-dm border border-dm-line bg-white p-3 text-sm"
            rows={6}
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            onBlur={() => void save(answers, insight)}
          />
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-dm-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" variant="ghost" size="sm" onClick={() => void wipe()}>
        {t("ai.clearAll")}
      </Button>
    </div>
  );
}
