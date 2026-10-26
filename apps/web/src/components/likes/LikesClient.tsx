"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

type MatchRow = {
  match_id: string;
  peer_id?: string;
  peer_name: string;
  conversation_id: string | null;
};

export function LikesClient() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [needAuth, setNeedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/matches");
    if (res.status === 401) {
      setNeedAuth(true);
      setLoading(false);
      return;
    }
    const json = (await res.json()) as {
      error?: { message?: string };
      data?: { matches?: MatchRow[] };
    };
    if (!res.ok) {
      setError(resolveApiErrorMessage(json, t, "matching.loadError"));
      setLoading(false);
      return;
    }
    setMatches(json.data?.matches ?? []);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label={t("matching.loading")} />;

  if (needAuth) {
    return (
      <EmptyState
        title={t("auth.needLoginTitle")}
        description={t("auth.needLoginBody")}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={t("matching.loadError")}
        description={error}
        onRetry={() => void load()}
        retryLabel={t("common.retry")}
      />
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        title={t("matching.emptyTitle")}
        description={t("matching.emptyBody")}
        action={
          <Link href="/discover">
            <Button type="button">{t("common.seeSuggestions")}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {matches.map((m) => (
        <li key={m.match_id}>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-dm-raspberry">{m.peer_name}</p>
              <p className="text-xs text-dm-muted">{t("matching.mutualMatch")}</p>
            </div>
            {m.conversation_id ? (
              <Link href={`/chat?c=${encodeURIComponent(m.conversation_id)}`}>
                <Button type="button" size="sm">
                  {t("matching.openChat")}
                </Button>
              </Link>
            ) : (
              <Button type="button" size="sm" variant="outline" disabled>
                {t("matching.noConversation")}
              </Button>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}
