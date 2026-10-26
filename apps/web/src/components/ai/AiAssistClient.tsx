"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TASK_IDS = [
  "deepmind",
  "profile_coach",
  "gift",
  "style",
  "beauty",
  "date_plan",
  "travel",
  "safety_tips",
] as const;

type Suggestion = { title: string; body: string; demo?: boolean };

export function AiAssistClient() {
  const t = useT();
  const tasks = [
    { id: "deepmind" as const, label: t("ai.taskDeepmind") },
    { id: "profile_coach" as const, label: t("ai.taskProfileCoach") },
    { id: "gift" as const, label: t("ai.taskGift") },
    { id: "style" as const, label: t("ai.taskStyle") },
    { id: "beauty" as const, label: t("ai.taskBeauty") },
    { id: "date_plan" as const, label: t("ai.taskDatePlan") },
    { id: "travel" as const, label: t("ai.taskTravel") },
    { id: "safety_tips" as const, label: t("ai.taskSafety") },
  ];
  const [task, setTask] = useState<(typeof TASK_IDS)[number]>("gift");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          consent,
          input: { occasion: t("ai.giftOccasion"), budget: t("ai.giftBudget") },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          resolveApiErrorMessage(json, t, "ai.callFailed"),
        );
        setSuggestions([]);
        return;
      }
      setDisclaimer(json.disclaimer ?? null);
      setSuggestions(json.suggestions ?? []);
    } catch {
      setError(t("ai.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tasks.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTask(item.id)}
            className={
              task === item.id
                ? "rounded-dm bg-dm-primary px-3 py-2 text-xs font-semibold text-white"
                : "rounded-dm bg-dm-surface px-3 py-2 text-xs font-semibold text-dm-raspberry"
            }
          >
            {item.label}
          </button>
        ))}
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
          <a href="/legal/ai" className="underline" target="_blank" rel="noreferrer">
            {t("ai.policyLink")}
          </a>
        </span>
      </label>
      <Button type="button" disabled={!consent || loading} onClick={run}>
        {loading ? t("ai.creating") : t("ai.getSuggestions")}
      </Button>
      {error ? (
        <p className="text-sm text-dm-danger" role="alert">
          {error}
        </p>
      ) : null}
      {disclaimer ? (
        <p className="text-xs text-dm-muted">{disclaimer}</p>
      ) : null}
      <div className="space-y-3">
        {suggestions.map((s) => (
          <Card key={s.title} className="text-sm">
            <p className="font-semibold text-dm-raspberry">
              {s.title}
              {s.demo ? ` · ${t("common.optional")}` : ""}
            </p>
            <p className="mt-1 text-dm-ink">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
