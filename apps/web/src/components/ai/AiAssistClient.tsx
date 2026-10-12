"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TASKS = [
  { id: "deepmind", label: "Tự khám phá" },
  { id: "profile_coach", label: "Profile Coach" },
  { id: "gift", label: "Quà tặng" },
  { id: "style", label: "Style" },
  { id: "beauty", label: "Beauty" },
  { id: "date_plan", label: "Date plan" },
  { id: "travel", label: "Travel" },
  { id: "safety_tips", label: "An toàn" },
] as const;

type Suggestion = { title: string; body: string; demo?: boolean };

export function AiAssistClient() {
  const [task, setTask] = useState<(typeof TASKS)[number]["id"]>("gift");
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
          input: { occasion: "buổi hẹn", budget: "vừa phải" },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          json?.error?.message ?? json?.message ?? "Không gọi được AI",
        );
        setSuggestions([]);
        return;
      }
      setDisclaimer(json.disclaimer ?? null);
      setSuggestions(json.suggestions ?? []);
    } catch {
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TASKS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTask(t.id)}
            className={
              task === t.id
                ? "rounded-dm bg-dm-primary px-3 py-2 text-xs font-semibold text-white"
                : "rounded-dm bg-dm-surface px-3 py-2 text-xs font-semibold text-dm-raspberry"
            }
          >
            {t.label}
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
        Tôi đồng ý dùng AI cho mục đích đã chọn (có thể thu hồi sau). Không dùng
        nhật ký riêng / chat thô mặc định.
      </label>
      <Button type="button" disabled={!consent || loading} onClick={run}>
        {loading ? "Đang tạo…" : "Nhận gợi ý"}
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
              {s.demo ? " · DEMO" : ""}
            </p>
            <p className="mt-1 text-dm-ink">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
