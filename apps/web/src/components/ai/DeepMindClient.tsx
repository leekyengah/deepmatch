"use client";

import { useEffect, useState } from "react";
import {
  DEEPMIND_DISCLAIMER,
  DEEPMIND_QUESTIONS,
  type DeepMindQuestion,
} from "@deepmatch/shared";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DeepMindClient() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [insight, setInsight] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

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
        setError(json?.error?.message ?? "Không lưu được");
        return;
      }
      setAnswers(json.answers ?? nextAnswers);
    } finally {
      setSaving(false);
    }
  }

  async function generateInsight() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "deepmind",
          consent: true,
          input: { answers },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Không tạo được gợi ý");
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
    if (!confirm("Xóa toàn bộ câu trả lời DeepMind?")) return;
    await fetch("/api/v1/ai/deepmind", { method: "DELETE" });
    setAnswers({});
    setInsight(null);
    setStep(0);
  }

  if (!loaded) {
    return <p className="text-sm text-dm-muted">Đang tải…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-dm-muted">{DEEPMIND_DISCLAIMER}</p>
      {q ? (
        <Card className="space-y-3 text-sm">
          <p className="text-xs font-bold text-dm-primary">
            Câu {step + 1}/{DEEPMIND_QUESTIONS.length}
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
              Trước
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setStep((s) => Math.min(DEEPMIND_QUESTIONS.length - 1, s + 1))
              }
              disabled={step >= DEEPMIND_QUESTIONS.length - 1}
            >
              Tiếp
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving || Object.keys(answers).length < 3}
              onClick={() => void generateInsight()}
            >
              {saving ? "Đang tạo…" : "Tạo thẻ tự phản ánh"}
            </Button>
          </div>
        </Card>
      ) : null}

      {insight ? (
        <Card className="whitespace-pre-wrap text-sm text-dm-ink">
          <p className="font-semibold text-dm-raspberry">Thẻ tự phản ánh (có thể sửa)</p>
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
        Xóa toàn bộ DeepMind
      </Button>
    </div>
  );
}
