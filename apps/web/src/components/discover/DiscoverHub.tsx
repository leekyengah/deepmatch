"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { track } from "@/lib/analytics";
import { useT } from "@/components/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

type Intent = "all" | "friendship" | "dating" | "marriage";

type Candidate = {
  userId: string;
  displayName: string;
  fuzzyRegion?: string;
  reasons: string[];
  interests: string[];
  goals: string[];
  values: string[];
  bio: string | null;
  jobTitle: string | null;
  age: number | null;
  avatarUrl: string | null;
  score: number;
  compatibility: {
    composite: number | null;
    confidence: "low" | "medium" | "high";
    dataMissing: string[];
    parts: {
      intent: number | null;
      values: number | null;
      lifestyle: number | null;
      communication: number | null;
      proximity: number | null;
    };
  } | null;
};

type Filters = {
  minAge: number;
  maxAge: number;
  region: string;
  q: string;
  strict: boolean;
};

const SAVE_KEY = "dm_discover_saved_v1";

const DEFAULT_FILTERS: Filters = {
  minAge: 18,
  maxAge: 60,
  region: "",
  q: "",
  strict: false,
};

type LoadState =
  | { kind: "loading" }
  | { kind: "need_auth" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      items: Candidate[];
      emptyReason: string | null;
    };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function DiscoverHub({ flagsOn }: { flagsOn: boolean }) {
  const t = useT();
  const [intent, setIntent] = useState<Intent>("all");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persistSaved = (ids: string[]) => {
    setSaved(ids);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  const load = useCallback(async () => {
    if (!flagsOn) {
      setState({ kind: "error", message: t("discovery.flagOff") });
      return;
    }
    setState({ kind: "loading" });
    const params = new URLSearchParams({
      page_size: "24",
      intent,
      min_age: String(filters.minAge),
      max_age: String(filters.maxAge),
    });
    if (filters.region) params.set("region", filters.region);
    if (filters.q) params.set("q", filters.q);
    if (filters.strict) params.set("strict", "1");

    const res = await fetch(`/api/v1/discovery/candidates?${params}`);
    if (res.status === 401) {
      setState({ kind: "need_auth" });
      return;
    }
    const json = await res.json();
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
    const items: Candidate[] = (json.data?.candidates ?? []).map(
      (c: Candidate) => ({
        ...c,
        displayName: c.displayName || t("discovery.unnamedProfile"),
        reasons: c.reasons ?? [],
        interests: c.interests ?? [],
        goals: c.goals ?? [],
        values: c.values ?? [],
      }),
    );
    setState({
      kind: "ready",
      items,
      emptyReason: json.data?.emptyReason ?? null,
    });
    setSelectedId(items[0]?.userId ?? null);
    setMobileIndex(0);
    void track("discover_view", { count: items.length });
  }, [flagsOn, filters, intent, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => {
    if (state.kind !== "ready") return null;
    return (
      state.items.find((i) => i.userId === selectedId) ?? state.items[0] ?? null
    );
  }, [state, selectedId]);

  const mobileCard =
    state.kind === "ready" ? state.items[mobileIndex] ?? null : null;

  async function act(targetId: string, action: "like" | "pass") {
    setBusyId(targetId);
    setToast(null);
    try {
      const res = await fetch("/api/v1/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast(
          resolveApiErrorMessage(json, t, "discovery.actionFailed"),
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
        setMobileIndex((idx) => Math.min(idx, Math.max(0, items.length - 1)));
        return { ...prev, items };
      });
    } finally {
      setBusyId(null);
    }
  }

  function toggleSave(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    persistSaved(next);
    setToast(
      next.includes(id) ? t("discovery.savedToast") : t("discovery.unsavedToast"),
    );
  }

  const intents: { id: Intent; label: string }[] = [
    { id: "all", label: t("discovery.intentAll") },
    { id: "friendship", label: t("discovery.intentFriendship") },
    { id: "dating", label: t("discovery.intentDating") },
    { id: "marriage", label: t("discovery.intentMarriage") },
  ];

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

  const emptyCopy =
    state.emptyReason === "MEDIA_GATE"
      ? t("discovery.emptyMediaGate")
      : state.emptyReason === "FILTERS_STRICT"
        ? t("discovery.emptyFilters")
        : state.emptyReason === "ACTED_ALL"
          ? t("discovery.emptyActed")
          : state.emptyReason === "NO_POOL"
            ? t("discovery.emptyPool")
            : t("discovery.emptyBody");

  return (
    <div className="dm-page-frame space-y-6 pb-16">
      {/* Header */}
      <header className="rounded-[22px] border border-dm-line bg-dm-surface p-5 shadow-[0_12px_40px_rgba(36,26,28,0.06)] sm:p-7">
        <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
          {t("discovery.title")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink sm:text-4xl">
          {t("discovery.v2Heading")}
        </h1>
        <p className="mt-2 max-w-2xl font-editorial text-sm text-dm-muted sm:text-base">
          {t("discovery.v2Intro")}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilters((f) => ({ ...f, q: draft.q }));
              }
            }}
            placeholder={t("discovery.searchPh")}
            className="min-h-11 flex-1 rounded-xl border border-dm-line bg-white px-4 text-sm outline-none focus:border-dm-primary"
          />
          <Button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, q: draft.q }))}
          >
            {t("discovery.search")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {t("discovery.filters")}
          </Button>
          <Link href="/me/edit">
            <Button type="button" variant="ghost">
              {t("discovery.completeProfile")}
            </Button>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {intents.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setIntent(tab.id)}
              className={
                intent === tab.id
                  ? "min-h-10 rounded-full bg-dm-primary px-4 text-sm font-semibold text-white"
                  : "min-h-10 rounded-full bg-dm-blush px-4 text-sm font-semibold text-dm-primary"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {toast ? (
        <p
          className="rounded-dm bg-dm-surface px-3 py-2 text-sm text-dm-primary"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        {/* Filters */}
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } rounded-[20px] border border-dm-line bg-dm-surface p-4 lg:sticky lg:top-4 lg:block lg:self-start`}
        >
          <h2 className="font-display text-lg font-semibold text-dm-ink">
            {t("discovery.filters")}
          </h2>
          <p className="mt-1 text-xs text-dm-muted">{t("discovery.filtersHint")}</p>
          <label className="mt-4 block text-xs font-bold uppercase text-dm-muted">
            {t("discovery.ageRange")}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              min={18}
              max={99}
              value={draft.minAge}
              onChange={(e) =>
                setDraft((d) => ({ ...d, minAge: Number(e.target.value) || 18 }))
              }
              className="min-h-10 w-full rounded-lg border border-dm-line px-2 text-sm"
            />
            <input
              type="number"
              min={18}
              max={99}
              value={draft.maxAge}
              onChange={(e) =>
                setDraft((d) => ({ ...d, maxAge: Number(e.target.value) || 60 }))
              }
              className="min-h-10 w-full rounded-lg border border-dm-line px-2 text-sm"
            />
          </div>
          <label className="mt-4 block text-xs font-bold uppercase text-dm-muted">
            {t("discovery.region")}
          </label>
          <input
            value={draft.region}
            onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
            placeholder={t("discovery.regionPh")}
            className="mt-2 min-h-10 w-full rounded-lg border border-dm-line px-3 text-sm"
          />
          <label className="mt-4 flex items-center gap-2 text-sm text-dm-ink">
            <input
              type="checkbox"
              checked={draft.strict}
              onChange={(e) =>
                setDraft((d) => ({ ...d, strict: e.target.checked }))
              }
            />
            {t("discovery.strictFilters")}
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setFilters({ ...draft });
                setFiltersOpen(false);
              }}
            >
              {t("discovery.applyFilters")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft(DEFAULT_FILTERS);
                setFilters(DEFAULT_FILTERS);
              }}
            >
              {t("discovery.resetFilters")}
            </Button>
          </div>
          <p className="mt-4 text-[11px] text-dm-champagne">
            {t("discovery.saveLocalNote")} · {saved.length}
          </p>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-5">
          {state.items.length === 0 ? (
            <EmptyState
              title={t("discovery.emptyTitle")}
              description={emptyCopy}
              action={
                <div className="flex flex-wrap gap-2">
                  {state.emptyReason === "MEDIA_GATE" ? (
                    <Link href="/me/media">
                      <Button type="button" size="sm">
                        {t("discovery.openMediaGate")}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setDraft(DEFAULT_FILTERS);
                        setFilters(DEFAULT_FILTERS);
                        setIntent("all");
                      }}
                    >
                      {t("discovery.relaxFilters")}
                    </Button>
                  )}
                  <Link href="/me/preferences">
                    <Button type="button" size="sm" variant="outline">
                      {t("needs.discoverNudgeCta")}
                    </Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              {/* Mobile card-first */}
              {mobileCard ? (
                <article className="overflow-hidden rounded-[22px] border border-dm-line bg-dm-surface shadow-dm lg:hidden">
                  <ProfileMedia
                    name={mobileCard.displayName}
                    avatarUrl={mobileCard.avatarUrl}
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-display text-2xl font-semibold text-dm-ink">
                          {mobileCard.displayName}
                          {mobileCard.age != null ? `, ${mobileCard.age}` : ""}
                        </h2>
                        <p className="text-sm text-dm-muted">
                          {mobileCard.fuzzyRegion || t("discovery.fuzzyRegion")}
                          {mobileCard.jobTitle
                            ? ` · ${mobileCard.jobTitle}`
                            : ""}
                        </p>
                      </div>
                      <CompatBadge c={mobileCard} t={t} />
                    </div>
                    <p className="text-sm text-dm-muted">
                      {mobileCard.reasons[0] ?? t("discovery.defaultReason")}
                    </p>
                    <ActionRow
                      id={mobileCard.userId}
                      busy={busyId === mobileCard.userId}
                      saved={saved.includes(mobileCard.userId)}
                      onLike={() => void act(mobileCard.userId, "like")}
                      onPass={() => void act(mobileCard.userId, "pass")}
                      onSave={() => toggleSave(mobileCard.userId)}
                      onSelect={() => setSelectedId(mobileCard.userId)}
                      t={t}
                    />
                    <div className="flex justify-between text-xs text-dm-muted">
                      <button
                        type="button"
                        disabled={mobileIndex <= 0}
                        onClick={() => setMobileIndex((i) => Math.max(0, i - 1))}
                        className="underline disabled:opacity-40"
                      >
                        {t("discovery.prev")}
                      </button>
                      <span>
                        {mobileIndex + 1}/{state.items.length}
                      </span>
                      <button
                        type="button"
                        disabled={mobileIndex >= state.items.length - 1}
                        onClick={() =>
                          setMobileIndex((i) =>
                            Math.min(state.items.length - 1, i + 1),
                          )
                        }
                        className="underline disabled:opacity-40"
                      >
                        {t("discovery.next")}
                      </button>
                    </div>
                  </div>
                </article>
              ) : null}

              {/* Desktop grid */}
              <div className="hidden gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {state.items.map((c) => (
                  <article
                    key={c.userId}
                    className={`overflow-hidden rounded-[18px] border bg-dm-surface shadow-[0_8px_28px_rgba(36,26,28,0.05)] transition ${
                      c.userId === selected?.userId
                        ? "border-dm-primary"
                        : "border-dm-line"
                    }`}
                  >
                    <button
                      type="button"
                      className="block w-full text-left"
                      onClick={() => setSelectedId(c.userId)}
                    >
                      <ProfileMedia
                        name={c.displayName}
                        avatarUrl={c.avatarUrl}
                        compact
                      />
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-dm-ink">
                              {c.displayName}
                              {c.age != null ? `, ${c.age}` : ""}
                            </h3>
                            <p className="text-xs text-dm-muted">
                              {c.fuzzyRegion || t("discovery.fuzzyRegion")}
                            </p>
                          </div>
                          <CompatBadge c={c} t={t} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.interests.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-dm-blush px-2 py-0.5 text-[10px] font-semibold text-dm-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="line-clamp-2 text-xs text-dm-muted">
                          {c.reasons[0] ?? t("discovery.defaultReason")}
                        </p>
                      </div>
                    </button>
                    <div className="border-t border-dm-line px-4 py-3">
                      <ActionRow
                        id={c.userId}
                        busy={busyId === c.userId}
                        saved={saved.includes(c.userId)}
                        onLike={() => void act(c.userId, "like")}
                        onPass={() => void act(c.userId, "pass")}
                        onSave={() => toggleSave(c.userId)}
                        onSelect={() => setSelectedId(c.userId)}
                        t={t}
                        compact
                      />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>

        {/* Detail / compatibility */}
        <aside className="hidden rounded-[20px] border border-dm-line bg-dm-surface p-5 lg:sticky lg:top-4 lg:block lg:self-start">
          {selected ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-dm-ink">
                {selected.displayName}
              </h2>
              <p className="text-sm text-dm-muted">
                {selected.jobTitle || t("discovery.jobUnknown")}
              </p>
              {selected.bio ? (
                <p className="text-sm leading-relaxed text-dm-ink">{selected.bio}</p>
              ) : (
                <p className="text-sm text-dm-muted">{t("discovery.noBio")}</p>
              )}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-dm-champagne">
                  {t("discovery.compatTitle")}
                </h3>
                {selected.compatibility?.composite != null ? (
                  <>
                    <p className="mt-1 font-display text-3xl font-semibold text-dm-ink">
                      {selected.compatibility.composite}
                      <span className="ml-1 text-sm font-normal text-dm-muted">
                        /100
                      </span>
                    </p>
                    <p className="text-xs text-dm-muted">
                      {t("discovery.compatExperimental")} ·{" "}
                      {t(`discovery.confidence_${selected.compatibility.confidence}`)}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-dm-muted">
                    {t("discovery.compatInsufficient")}
                  </p>
                )}
                <ul className="mt-3 space-y-1 text-xs text-dm-muted">
                  {selected.reasons.slice(0, 3).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-dm-champagne">
                  {t("discovery.collections")}
                </h3>
                <p className="mt-1 text-xs text-dm-muted">
                  {t("discovery.collectionsHint")}
                </p>
                <div className="mt-2 space-y-2">
                  <CollectionChip
                    label={t("discovery.colShared")}
                    count={
                      state.items.filter((i) => i.interests.length > 0).length
                    }
                  />
                  <CollectionChip
                    label={t("discovery.colSaved")}
                    count={saved.length}
                  />
                </div>
              </div>
              <Link
                href="/me/privacy"
                className="inline-block text-xs font-semibold text-dm-champagne underline"
              >
                {t("discovery.reportHint")}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-dm-muted">{t("discovery.selectHint")}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProfileMedia({
  name,
  avatarUrl,
  compact,
}: {
  name: string;
  avatarUrl: string | null;
  compact?: boolean;
}) {
  return (
    <div className="relative dm-media-portrait bg-gradient-to-br from-dm-blush to-dm-line">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          className="dm-media-cover"
          sizes="(max-width: 1024px) 100vw, 320px"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-4xl font-semibold text-dm-primary/50">
            {initials(name) || "DM"}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-dm-ink/50 to-transparent" />
    </div>
  );
}

function CompatBadge({
  c,
  t,
}: {
  c: Candidate;
  t: (k: string, p?: Record<string, string | number>) => string;
}) {
  if (c.compatibility?.composite == null) {
    return (
      <Badge tone="warn">{t("discovery.compatLowData")}</Badge>
    );
  }
  return (
    <Badge tone="good">
      {c.compatibility.composite}% · {c.compatibility.confidence}
    </Badge>
  );
}

function ActionRow({
  busy,
  saved,
  onLike,
  onPass,
  onSave,
  onSelect,
  t,
  compact,
}: {
  id: string;
  busy: boolean;
  saved: boolean;
  onLike: () => void;
  onPass: () => void;
  onSave: () => void;
  onSelect: () => void;
  t: (k: string) => string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : ""}`}>
      <Button type="button" size="sm" disabled={busy} onClick={onLike}>
        {t("discovery.like")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={onSave}
      >
        {saved ? t("discovery.saved") : t("discovery.save")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={onPass}
      >
        {t("discovery.pass")}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onSelect}>
        {t("discovery.viewProfile")}
      </Button>
    </div>
  );
}

function CollectionChip({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl border border-dm-line bg-dm-panel px-3 py-2 text-xs text-dm-ink">
      {label}
      <span className="ml-2 text-dm-muted">{count}</span>
    </div>
  );
}
