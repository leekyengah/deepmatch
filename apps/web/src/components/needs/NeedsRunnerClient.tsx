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

type Props = {
  preset?: "full" | "onboarding";
  finishHref?: string;
  showReview?: boolean;
};

export function NeedsRunnerClient({
  preset = "full",
  finishHref,
  showReview = true,
}: Props) {
  const t = useT();
  const [questions, setQuestions] = useState<NeedsQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(preset === "onboarding" ? 7 : 100);
  const [view, setView] = useState<"run" | "review">("run");

  const load = useCallback(
    async (c01?: string) => {
      setLoading(true);
      const qUrl =
        preset === "onboarding"
          ? `/api/v1/needs/questions?set=onboarding${c01 ? `&c01=${encodeURIComponent(c01)}` : ""}`
          : "/api/v1/needs/questions?limit=100";
      const [qRes, aRes] = await Promise.all([
        fetch(qUrl),
        fetch("/api/v1/needs/answers"),
      ]);
      if (!qRes.ok || !aRes.ok) {
        setMessage(t("needs.loadError"));
        setLoading(false);
        return;
      }
      const qJson = (await qRes.json()) as {
        data?: { questions?: NeedsQuestion[]; total?: number; applicable?: number };
      };
      const aJson = (await aRes.json()) as {
        data?: { answers?: Record<string, string>; consent_at?: string | null };
      };
      const nextAnswers = aJson.data?.answers ?? {};
      setQuestions(qJson.data?.questions ?? []);
      setTotal(
        preset === "onboarding"
          ? (qJson.data?.total ?? 7)
          : (qJson.data?.total ?? 100),
      );
      setAnswers(nextAnswers);
      setConsent(Boolean(aJson.data?.consent_at));
      setLoading(false);
    },
    [preset, t],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // When C01 changes in onboarding, refresh the 7th (mode) question.
  useEffect(() => {
    if (preset !== "onboarding") return;
    const c01 = answers.C01;
    if (!c01) return;
    void (async () => {
      const res = await fetch(
        `/api/v1/needs/questions?set=onboarding&c01=${encodeURIComponent(c01)}`,
      );
      if (!res.ok) return;
      const json = (await res.json()) as {
        data?: { questions?: NeedsQuestion[] };
      };
      const next = json.data?.questions ?? [];
      setQuestions((prev) => {
        if (
          prev.length === next.length &&
          prev.every((q, i) => q.id === next[i]?.id)
        ) {
          return prev;
        }
        return next;
      });
    })();
  }, [answers.C01, preset]);

  const current = questions[idx];
  const answeredCount = useMemo(
    () =>
      questions.filter((q) => answers[q.id]?.trim()).length,
    [answers, questions],
  );

  const reviewed = useMemo(
    () =>
      questions
        .filter((q) => answers[q.id]?.trim())
        .map((q) => ({ q, value: answers[q.id]! })),
    [answers, questions],
  );

  async function save(next: Record<string, string>, withConsent = consent) {
    if (!withConsent) {
      setMessage(t("needs.consentRequired"));
      return false;
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
      return false;
    }
    const json = (await res.json()) as {
      data?: { answers?: Record<string, string> };
    };
    setAnswers(json.data?.answers ?? next);
    setConsent(true);
    setMessage(t("needs.saved"));
    return true;
  }

  async function revoke() {
    setSaving(true);
    await fetch("/api/v1/needs/answers", { method: "DELETE" });
    setAnswers({});
    setConsent(false);
    setSaving(false);
    setMessage(t("needs.revoked"));
  }

  async function deleteOne(id: string) {
    setSaving(true);
    const res = await fetch(`/api/v1/needs/answers?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (!res.ok) {
      setMessage(t("needs.saveError"));
      return;
    }
    const json = (await res.json()) as {
      data?: { answers?: Record<string, string> };
    };
    setAnswers(json.data?.answers ?? {});
    setMessage(t("needs.deletedOne"));
  }

  if (loading) return <LoadingState label={t("needs.loading")} />;
  if (!current && view === "run") {
    return <p className="text-sm text-dm-muted">{t("needs.empty")}</p>;
  }

  const options = current
    ? current.answerType
        .replace(/^MỘT:\s*/i, "")
        .replace(/^NHIỀU[^:]+:\s*/i, "")
        .split(/\s*\/\s*/)
        .map((s) => s.replace(/;.*$/, "").trim())
        .filter((s) => s && !/^MỞ/i.test(s) && !/^SỐ/i.test(s))
    : [];

  const isOpen = current
    ? /^MỞ/i.test(current.answerType) ||
      /^SỐ/i.test(current.answerType) ||
      options.length < 2
    : false;

  const complete =
    preset === "onboarding" && answeredCount >= Math.min(7, questions.length);

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

      {showReview ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "run" ? "primary" : "outline"}
            onClick={() => setView("run")}
          >
            {t("needs.tabRun")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "review" ? "primary" : "outline"}
            onClick={() => setView("review")}
          >
            {t("needs.tabReview")}
          </Button>
        </div>
      ) : null}

      {view === "review" ? (
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-dm-ink">
            {t("needs.reviewTitle")}
          </h2>
          {reviewed.length === 0 ? (
            <p className="text-sm text-dm-muted">{t("needs.reviewEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {reviewed.map(({ q, value }) => (
                <li
                  key={q.id}
                  className="rounded-dm border border-dm-line bg-dm-surface px-3 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{q.id}</Badge>
                    <Badge tone="good">{q.group}</Badge>
                  </div>
                  <p className="mt-2 font-medium text-dm-ink">{q.promptVi}</p>
                  <p className="mt-1 text-dm-muted">{value}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const i = questions.findIndex((x) => x.id === q.id);
                        if (i >= 0) setIdx(i);
                        setView("run");
                      }}
                    >
                      {t("needs.editAnswer")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => void deleteOne(q.id)}
                    >
                      {t("needs.deleteAnswer")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              {answeredCount}/{total}
            </Badge>
            <Badge tone="default">
              {idx + 1}/{questions.length}
            </Badge>
            <Badge tone="good">{current!.group}</Badge>
            <span className="text-xs text-dm-muted">{current!.id}</span>
          </div>

          <Card>
            <h2 className="font-display text-2xl font-semibold text-dm-ink">
              {current!.promptVi}
            </h2>
            <p className="mt-2 text-xs text-dm-muted">{current!.answerType}</p>

            {isOpen ? (
              <textarea
                className="mt-4 w-full rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-sm"
                rows={4}
                value={answers[current!.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [current!.id]: e.target.value,
                  }))
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
                      answers[current!.id] === opt
                        ? "rounded-dm border border-dm-primary bg-dm-blush px-3 py-2 text-left text-sm font-semibold text-dm-primary"
                        : "rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-left text-sm text-dm-ink"
                    }
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [current!.id]: opt,
                      }))
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
                      [current!.id]: t("needs.skipAnswer"),
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
              {finishHref && complete ? (
                <FinishLink href={finishHref} label={t("needs.finishOnboarding")} />
              ) : null}
            </div>
          </Card>
        </>
      )}

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

function FinishLink({ href, label }: { href: string; label: string }) {
  // Avoid expo-router in Next web — use plain navigation.
  return (
    <Button
      type="button"
      onClick={() => {
        window.location.href = href;
      }}
    >
      {label}
    </Button>
  );
}
