"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";
import { track } from "@/lib/analytics";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

type Candidate = {
  userId: string;
  displayName: string;
  fuzzyRegion?: string;
  reasons: string[];
};

type LoadState =
  | { kind: "loading" }
  | { kind: "need_auth" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: Candidate[] };

export function DiscoverClient({ flagsOn }: { flagsOn: boolean }) {
  const t = useT();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!flagsOn) {
      setState({ kind: "error", message: t("discovery.flagOff") });
      return;
    }
    setState({ kind: "loading" });
    const res = await fetch("/api/v1/discovery/candidates");
    if (res.status === 401) {
      setState({ kind: "need_auth" });
      return;
    }
    const json = (await res.json()) as {
      error?: { message?: string; code?: string; key?: string };
      data?: {
        candidates?: Array<{
          userId: string;
          displayName?: string;
          fuzzyRegion?: string;
          reasons?: string[];
        }>;
      };
    };
    if (!res.ok) {
      const code = json.error?.code;
      setState({
        kind: "error",
        message:
          code === "FORBIDDEN" &&
          (json.error?.key === "errors.flagDiscoveryOff" ||
            json.error?.key === "errors.flagDiscoveryUserOff")
            ? t("discovery.discoveryOff")
            : resolveApiErrorMessage(json, t, "discovery.loadError"),
      });
      return;
    }
    const items: Candidate[] = (json.data?.candidates ?? []).map((c) => ({
      userId: c.userId,
      displayName: c.displayName ?? t("discovery.unnamedProfile"),
      fuzzyRegion: c.fuzzyRegion,
      reasons: c.reasons ?? [],
    }));
    setState({ kind: "ready", items });
    setSelectedId(items[0]?.userId ?? null);
  }, [flagsOn, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(targetId: string, action: "like" | "pass") {
    setBusyId(targetId);
    setToast(null);
    try {
      const res = await fetch("/api/v1/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, action }),
      });
      const json = (await res.json()) as {
        error?: string | { message?: string };
        mutual?: boolean;
      };
      if (!res.ok) {
        setToast(
          typeof json.error === "string"
            ? json.error
            : resolveApiErrorMessage(json, t, "discovery.actionFailed"),
        );
        return;
      }
      void track(action === "like" ? "discover_like" : "discover_pass");
      if (action === "like" && json.mutual) {
        setToast(t("discovery.mutualToast"));
      } else if (action === "like") {
        setToast(t("discovery.likeSuccess"));
      } else {
        setToast(t("discovery.passSuccess"));
      }
      setState((prev) => {
        if (prev.kind !== "ready") return prev;
        const items = prev.items.filter((i) => i.userId !== targetId);
        setSelectedId((cur) =>
          cur === targetId ? (items[0]?.userId ?? null) : cur,
        );
        return { kind: "ready", items };
      });
    } finally {
      setBusyId(null);
    }
  }

  if (state.kind === "loading") {
    return <LoadingState label={t("discovery.loading")} />;
  }
  if (state.kind === "need_auth") {
    return (
      <EmptyState
        title={t("auth.needLoginTitle")}
        description={t("discovery.needAuthBody")}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }
  if (state.kind === "error") {
    return (
      <ErrorState
        title={t("discovery.errorTitle")}
        description={state.message}
        onRetry={() => void load()}
        retryLabel={t("common.retry")}
        action={
          <Link href="/me/deep">
            <Button type="button" size="sm" variant="secondary">
              {t("discovery.openDeepProfile")}
            </Button>
          </Link>
        }
      />
    );
  }

  const selected =
    state.items.find((i) => i.userId === selectedId) ?? state.items[0] ?? null;

  return (
    <div>
      {toast ? (
        <p
          className="mb-4 rounded-dm bg-dm-surface px-3 py-2 text-sm text-dm-primary"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      {state.items.length === 0 || !selected ? (
        <EmptyState
          title={t("discovery.emptyTitle")}
          description={t("discovery.emptyBody")}
          action={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => void load()}
            >
              {t("common.reload")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* DATING-02 feed card */}
          <article className="overflow-hidden rounded-[20px] border border-dm-line bg-dm-panel shadow-dm">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-dm-blush to-dm-line">
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-dm-deep/75 via-transparent to-transparent p-5">
                <div className="text-white">
                  <p className="font-display text-2xl font-semibold">
                    {selected.displayName}
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    {selected.fuzzyRegion
                      ? t("discovery.fuzzyRegionWith", {
                          region: selected.fuzzyRegion,
                        })
                      : t("discovery.fuzzyRegion")}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <Badge tone="good">{t("discovery.badge")}</Badge>
              <p className="text-sm leading-relaxed text-dm-muted">
                {selected.reasons[0] ?? t("discovery.defaultReason")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={busyId === selected.userId}
                  onClick={() => setSelectedId(selected.userId)}
                  variant="outline"
                >
                  {t("discovery.viewProfile")}
                </Button>
                <Button
                  type="button"
                  disabled={busyId === selected.userId}
                  onClick={() => void act(selected.userId, "like")}
                  className="rounded-full px-5"
                  aria-label={t("discovery.like")}
                >
                  ♡ {t("discovery.like")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busyId === selected.userId}
                  onClick={() => void act(selected.userId, "pass")}
                >
                  {t("discovery.pass")}
                </Button>
              </div>
            </div>
          </article>

          {/* DATING-03 detail panel */}
          <aside className="rounded-[20px] border border-dm-line bg-dm-surface p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-dm-ink">
                  {selected.displayName}
                </h2>
                <p className="mt-1 text-sm text-dm-muted">
                  {selected.fuzzyRegion ?? t("discovery.fuzzyRegion")}
                </p>
              </div>
              <Link
                href="/me/privacy"
                className="text-xs font-semibold text-dm-champagne underline"
              >
                {t("discovery.reportHint")}
              </Link>
            </div>
            <h3 className="mt-6 font-display text-lg text-dm-ink">
              {t("discovery.aboutTitle")}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-dm-muted">
              {selected.reasons.length === 0 ? (
                <li>{t("discovery.defaultReason")}</li>
              ) : (
                selected.reasons.map((r) => <li key={r}>{r}</li>)
              )}
            </ul>
            <h3 className="mt-6 font-display text-lg text-dm-ink">
              {t("discovery.sharedValues")}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(selected.reasons.length
                ? selected.reasons.slice(0, 3)
                : [t("discovery.defaultReason")]
              ).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-dm-line bg-dm-panel px-3 py-1 text-xs font-medium text-dm-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mt-6 font-display text-lg text-dm-ink">
              {t("discovery.starterQuestion")}
            </h3>
            <p className="mt-2 rounded-dm border border-dm-line bg-dm-panel px-3 py-3 text-sm text-dm-muted">
              {t("discovery.starterPrompt")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busyId === selected.userId}
                onClick={() => void act(selected.userId, "like")}
              >
                {t("discovery.sendGreeting")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busyId === selected.userId}
                onClick={() => void act(selected.userId, "pass")}
              >
                {t("discovery.pass")}
              </Button>
            </div>
          </aside>

          {state.items.length > 1 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
              {state.items.map((c) => (
                <li key={c.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.userId)}
                    className={`w-full rounded-dm border px-4 py-3 text-left transition ${
                      c.userId === selected.userId
                        ? "border-dm-primary bg-dm-blush"
                        : "border-dm-line bg-dm-panel hover:border-dm-champagne"
                    }`}
                  >
                    <p className="font-semibold text-dm-ink">{c.displayName}</p>
                    <p className="text-xs text-dm-muted">
                      {c.fuzzyRegion ?? t("discovery.fuzzyRegion")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
