"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

  const load = useCallback(async () => {
    if (!flagsOn) {
      setState({
        kind: "error",
        message: t("discovery.flagOff"),
      });
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
        ok?: boolean;
        mutual?: boolean;
        createsPairSpace?: boolean;
      };
      if (!res.ok) {
        setToast(
          typeof json.error === "string"
            ? json.error
            : (resolveApiErrorMessage(json, t, "discovery.actionFailed")),
        );
        return;
      }
      if (action === "like" && json.mutual) {
        setToast(t("discovery.mutualToast"));
      } else if (action === "like") {
        setToast(t("discovery.likeSuccess"));
      } else {
        setToast(t("discovery.passSuccess"));
      }
      setState((prev) =>
        prev.kind === "ready"
          ? {
              kind: "ready",
              items: prev.items.filter((i) => i.userId !== targetId),
            }
          : prev,
      );
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

  return (
    <div>
      {toast ? (
        <p
          className="mb-4 rounded-dm bg-dm-surface px-3 py-2 text-sm text-dm-raspberry"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      {state.items.length === 0 ? (
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
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((c) => (
            <li key={c.userId}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-dm-raspberry">
                      {c.displayName}
                    </p>
                    <p className="text-sm text-dm-muted">
                      {c.fuzzyRegion
                        ? t("discovery.fuzzyRegionWith", {
                            region: c.fuzzyRegion,
                          })
                        : t("discovery.fuzzyRegion")}
                    </p>
                  </div>
                  <Badge>{t("discovery.badge")}</Badge>
                </div>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-dm-ink">
                  {c.reasons.length === 0 ? (
                    <li>{t("discovery.defaultReason")}</li>
                  ) : (
                    c.reasons.map((r) => <li key={r}>{r}</li>)
                  )}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === c.userId}
                    onClick={() => void act(c.userId, "like")}
                  >
                    {t("discovery.like")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busyId === c.userId}
                    onClick={() => void act(c.userId, "pass")}
                  >
                    {t("discovery.pass")}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
