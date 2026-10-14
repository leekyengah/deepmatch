"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TASKS = [
  "profile_coach",
  "deepmind",
  "gift",
  "style",
  "beauty",
  "date_plan",
  "travel",
  "safety_tips",
] as const;

type TaskId = (typeof TASKS)[number];

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  demo?: boolean;
};

type Props = {
  initialTask?: string;
  onTaskChange?: (task: string) => void;
};

const SESSION_KEY = "dm_ai_session_thread_v1";

export function AiChatWorkspace({ initialTask = "gift", onTaskChange }: Props) {
  const t = useT();
  const [task, setTask] = useState<TaskId>(
    TASKS.includes(initialTask as TaskId) ? (initialTask as TaskId) : "gift",
  );
  const [consent, setConsent] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (TASKS.includes(initialTask as TaskId)) {
      setTask(initialTask as TaskId);
    }
  }, [initialTask]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          task?: TaskId;
          messages?: ChatMessage[];
        };
        if (parsed.task && TASKS.includes(parsed.task)) setTask(parsed.task);
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ task, messages }),
      );
    } catch {
      /* ignore */
    }
  }, [task, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const taskLabel = useCallback(
    (id: TaskId) => {
      const map: Record<TaskId, string> = {
        profile_coach: t("ai.taskProfileCoach"),
        deepmind: t("ai.taskDeepmind"),
        gift: t("ai.taskGift"),
        style: t("ai.taskStyle"),
        beauty: t("ai.taskBeauty"),
        date_plan: t("ai.taskDatePlan"),
        travel: t("ai.taskTravel"),
        safety_tips: t("ai.taskSafety"),
      };
      return map[id];
    },
    [t],
  );

  async function send(prompt?: string) {
    if (sendingRef.current || loading) return;
    if (!consent) {
      setError(t("ai.consentRequired"));
      return;
    }
    const text = (prompt ?? input).trim();
    if (!text) return;

    sendingRef.current = true;
    setLoading(true);
    setError(null);
    setInput("");
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          consent: true,
          input: {
            occasion: text,
            note: text,
            budget: t("ai.giftBudget"),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(resolveApiErrorMessage(json, t, "ai.callFailed"));
        return;
      }
      const suggestions = (json.suggestions ?? []) as Array<{
        title: string;
        body: string;
        demo?: boolean;
      }>;
      const assistantText =
        suggestions.length > 0
          ? suggestions
              .map((s) => `**${s.title}**\n${s.body}`)
              .join("\n\n")
          : t("ai.emptySuggestions");
      const disclaimer = json.disclaimer
        ? `\n\n_${json.disclaimer}_`
        : "";
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          text: assistantText + disclaimer,
          demo: suggestions.some((s) => s.demo) || json.adapter === "stub",
        },
      ]);
    } catch {
      setError(t("ai.networkError"));
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }

  function copyLast() {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    void navigator.clipboard?.writeText(last.text.replace(/\*\*|_/g, ""));
  }

  function clearSession() {
    setMessages([]);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[22px] border border-dm-line bg-dm-surface shadow-[0_12px_40px_rgba(36,26,28,0.06)]">
      <header className="border-b border-dm-line px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-dm-ink">
              {t("ai.chatHeading")}
            </h2>
            <p className="text-xs text-dm-muted">{t("ai.chatSessionOnly")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyLast}>
              {t("ai.copyReply")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading || messages.length === 0}
              onClick={() => {
                const lastUser = [...messages]
                  .reverse()
                  .find((m) => m.role === "user");
                if (lastUser) void send(lastUser.text);
              }}
            >
              {t("ai.regenerate")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clearSession}>
              {t("ai.clearChat")}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TASKS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTask(id);
                onTaskChange?.(id);
              }}
              className={
                task === id
                  ? "min-h-9 rounded-full bg-dm-primary px-3 text-xs font-semibold text-white"
                  : "min-h-9 rounded-full bg-dm-blush px-3 text-xs font-semibold text-dm-primary"
              }
            >
              {taskLabel(id)}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.length === 0 ? (
          <Card className="border-dashed text-sm text-dm-muted">
            {t("ai.chatEmpty")}
          </Card>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-8 rounded-2xl bg-dm-primary px-4 py-3 text-sm text-white"
                : "mr-8 rounded-2xl bg-dm-panel px-4 py-3 text-sm text-dm-ink"
            }
          >
            <p className="whitespace-pre-wrap leading-relaxed">
              {m.text.replace(/\*\*/g, "")}
            </p>
            {m.demo ? (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-dm-champagne">
                {t("ai.stubBadge")}
              </p>
            ) : null}
          </div>
        ))}
        {loading ? (
          <p className="text-sm text-dm-muted" aria-live="polite">
            {t("ai.creating")}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-dm-line px-4 py-3 sm:px-5">
        <label className="mb-3 flex items-start gap-2 text-xs text-dm-ink sm:text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            {t("ai.consentText")}{" "}
            <a
              href="/legal/ai"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              {t("ai.policyLink")}
            </a>
          </span>
        </label>
        {error ? (
          <p className="mb-2 text-sm text-dm-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t("ai.chatPlaceholder")}
            className="min-h-11 flex-1 rounded-xl border border-dm-line bg-white px-3 text-sm text-dm-ink outline-none focus:border-dm-primary"
            disabled={loading}
          />
          <Button
            type="button"
            disabled={!consent || loading || !input.trim()}
            onClick={() => void send()}
          >
            {t("ai.send")}
          </Button>
        </div>
      </footer>
    </section>
  );
}
