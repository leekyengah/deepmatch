"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/components/ui/cn";
import {
  confirmMedia,
  uploadWithIntent,
  type UploadIntentResponse,
} from "@/lib/media/client-upload";

type MatchRow = {
  match_id: string;
  conversation_id: string | null;
  peer_id?: string;
  peer_name: string;
  peer_region?: string | null;
  peer_job?: string | null;
  unread_count?: number;
  last_message?: string | null;
  last_message_at?: string | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  body: string | null;
  media_id?: string | null;
  media_url?: string | null;
  media_content_type?: string | null;
  created_at: string;
  client_dedupe_key: string | null;
};

type PeerContext = {
  id: string;
  displayName: string | null;
  bio: string | null;
  region: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  interests: string[];
  shared: { interests: string[]; values: string[]; goals: string[] };
};

type HubFilter = "all" | "unread" | "favorites" | "archived";
type ContextTab = "profile" | "common" | "memories" | "dates";

const FAV_KEY = "dm_chat_fav_v1";
const ARCH_KEY = "dm_chat_arch_v1";

function loadIds(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatLounge({ chatEnabled }: { chatEnabled: boolean }) {
  const t = useT();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const queryConversation = searchParams.get("c");

  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    queryConversation,
  );
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [online, setOnline] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [hubFilter, setHubFilter] = useState<HubFilter>("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [contextTab, setContextTab] = useState<ContextTab>("profile");
  const [peer, setPeer] = useState<PeerContext | null>(null);
  const [mobilePane, setMobilePane] = useState<"list" | "thread" | "context">(
    "list",
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<Array<{ title: string; body: string }>>(
    [],
  );
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    setFavorites(loadIds(FAV_KEY));
    setArchived(loadIds(ARCH_KEY));
  }, []);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      setReconnecting(false);
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const loadMatches = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const res = await fetch("/api/v1/matches");
    if (!res.ok) {
      setError(t("chat.loadMatchesError"));
      setLoading(false);
      return;
    }
    const json = await res.json();
    const mapped: MatchRow[] = (json.data?.matches ?? []).map(
      (m: MatchRow & { peer_name?: string }) => ({
        match_id: m.match_id,
        conversation_id: m.conversation_id,
        peer_id: m.peer_id,
        peer_name: m.peer_name ?? t("chat.peerDefault"),
        peer_region: m.peer_region,
        peer_job: m.peer_job,
        unread_count: m.unread_count ?? 0,
        last_message: m.last_message,
        last_message_at: m.last_message_at,
      }),
    );
    setMatches(mapped);
    setActiveConversationId((current) => {
      if (current && mapped.some((m) => m.conversation_id === current)) {
        return current;
      }
      if (
        queryConversation &&
        mapped.some((m) => m.conversation_id === queryConversation)
      ) {
        return queryConversation;
      }
      return mapped.find((m) => m.conversation_id)?.conversation_id ?? null;
    });
    setLoading(false);
  }, [supabase, queryConversation, t]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (!activeConversationId || !chatEnabled) {
      setPeer(null);
      return;
    }
    let cancelled = false;
    setReconnecting(!online);

    (async () => {
      const res = await fetch(
        `/api/v1/messages?conversationId=${encodeURIComponent(activeConversationId)}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          typeof body?.reason === "string"
            ? body.reason
            : t("chat.openThreadError"),
        );
        setMessages([]);
        return;
      }
      const json = (await res.json()) as { messages?: MessageRow[] };
      if (!cancelled) {
        setError(null);
        setMessages(json.messages ?? []);
        setReconnecting(false);
      }
      await fetch("/api/v1/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: activeConversationId }),
      });
      if (!cancelled) await loadMatches();

      const peerRes = await fetch(
        `/api/v1/chat/peer?conversationId=${encodeURIComponent(activeConversationId)}`,
      );
      if (peerRes.ok) {
        const pj = await peerRes.json();
        if (!cancelled && pj.ok) setPeer(pj.peer);
      } else if (!cancelled) {
        setPeer(null);
      }
    })();

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
          if (row.media_id && !row.media_url) {
            void fetch(
              `/api/v1/messages?conversationId=${encodeURIComponent(activeConversationId)}`,
            )
              .then((r) => r.json())
              .then((j) => {
                if (j.messages) setMessages(j.messages);
              });
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [activeConversationId, chatEnabled, supabase, loadMatches, t, online]);

  const activePeer = matches.find(
    (m) => m.conversation_id === activeConversationId,
  );

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (!m.conversation_id) return false;
      if (hubFilter === "unread" && !(m.unread_count && m.unread_count > 0)) {
        return false;
      }
      if (hubFilter === "favorites" && !favorites.includes(m.match_id)) {
        return false;
      }
      if (hubFilter === "archived") {
        return archived.includes(m.match_id);
      }
      if (archived.includes(m.match_id)) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.peer_name.toLowerCase().includes(q) ||
          (m.last_message ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [matches, hubFilter, favorites, archived, search]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!activeConversationId || !text.trim() || sending || !online) return;
    setSending(true);
    setError(null);
    const dedupe = crypto.randomUUID();
    const optimistic = text.trim();
    setText("");
    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          text: optimistic,
          clientDedupeKey: dedupe,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.reason ?? body?.error ?? t("chat.sendFailed"));
        setText(optimistic);
      }
    } finally {
      setSending(false);
    }
  }

  async function sendMedia(file: File | null) {
    if (!file || !activeConversationId || uploading) return;
    setUploading(true);
    setAttachOpen(false);
    setError(null);
    try {
      const allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
      ]);
      if (!allowed.has(file.type)) {
        setError(t("chat.mediaTypeError"));
        return;
      }
      const isVideo = file.type.startsWith("video/");
      const max = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > max) {
        setError(isVideo ? t("chat.mediaVideoMax") : t("chat.mediaImageMax"));
        return;
      }
      const intentRes = await fetch("/api/v1/media/upload-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: file.type,
          bytes: file.size,
          conversation_id: activeConversationId,
        }),
      });
      const intent = (await intentRes.json()) as {
        error?: { message?: string };
        data?: UploadIntentResponse;
      };
      if (!intentRes.ok || !intent.data?.upload) {
        setError(
          resolveApiErrorMessage(intent, t, "chat.mediaUploadFailed") ||
            t("chat.mediaUploadFailed"),
        );
        return;
      }
      const up = await uploadWithIntent(
        intent.data,
        file,
        async ({ path, token, file: f, contentType }) => {
          const { error } = await supabase.storage
            .from("media")
            .uploadToSignedUrl(path, token, f, { contentType });
          return { error: error ? new Error(error.message) : null };
        },
      );
      if (up.error) {
        setError(up.error);
        return;
      }
      const confirmed = await confirmMedia(intent.data.media_id);
      if (!confirmed.ok) {
        setError(confirmed.error ?? t("chat.mediaUploadFailed"));
        return;
      }
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          mediaId: intent.data.media_id,
          text: "",
          clientDedupeKey: crypto.randomUUID(),
        }),
      });
      if (!res.ok) {
        setError(t("chat.mediaSendFailed"));
        return;
      }
      const reload = await fetch(
        `/api/v1/messages?conversationId=${encodeURIComponent(activeConversationId)}`,
      );
      if (reload.ok) {
        const json = (await reload.json()) as { messages?: MessageRow[] };
        setMessages(json.messages ?? []);
      }
    } finally {
      setUploading(false);
    }
  }

  async function blockPeer() {
    if (!activePeer?.peer_id) {
      setSafetyNote(t("chat.blockMissingPeer"));
      return;
    }
    const res = await fetch("/api/v1/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_user_id: activePeer.peer_id }),
    });
    const json = await res.json();
    if (!res.ok) {
      setSafetyNote(resolveApiErrorMessage(json, t, "chat.blockFailed"));
      return;
    }
    setSafetyNote(t("chat.blocked"));
    setActiveConversationId(null);
    setMobilePane("list");
    await loadMatches();
  }

  async function submitReport() {
    if (!reportReason.trim() || !activeConversationId) return;
    const res = await fetch("/api/v1/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_user_id: activePeer?.peer_id,
        conversation_id: activeConversationId,
        reason: reportReason.trim(),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setSafetyNote(resolveApiErrorMessage(json, t, "chat.reportFailed"));
      setReportOpen(false);
      return;
    }
    setReportOpen(false);
    setReportReason("");
    setSafetyNote(t("chat.reportSent"));
  }

  async function loadAiTips() {
    if (!aiConsent) return;
    setAiLoading(true);
    setAiTips([]);
    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "match_hints",
          consent: true,
          input: {
            peer: activePeer?.peer_name,
            shared: peer?.shared?.interests ?? [],
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSafetyNote(resolveApiErrorMessage(json, t, "chat.aiFailed"));
        return;
      }
      setAiTips(json.suggestions ?? []);
    } finally {
      setAiLoading(false);
    }
  }

  function toggleFav(matchId: string) {
    const next = favorites.includes(matchId)
      ? favorites.filter((x) => x !== matchId)
      : [...favorites, matchId];
    setFavorites(next);
    saveIds(FAV_KEY, next);
  }

  function toggleArch(matchId: string) {
    const next = archived.includes(matchId)
      ? archived.filter((x) => x !== matchId)
      : [...archived, matchId];
    setArchived(next);
    saveIds(ARCH_KEY, next);
  }

  function selectConversation(id: string) {
    setActiveConversationId(id);
    setMobilePane("thread");
  }

  if (!chatEnabled) {
    return (
      <ErrorState
        title={t("chat.flagOffTitle")}
        description={t("chat.flagOffBody")}
      />
    );
  }
  if (loading) return <LoadingState label={t("chat.loading")} />;
  if (!userId) {
    return (
      <EmptyState
        title={t("auth.needLoginTitle")}
        description={t("chat.needAuthBody")}
        action={
          <Link href="/login">
            <Button type="button">{t("auth.login")}</Button>
          </Link>
        }
      />
    );
  }

  const hubFilters: { id: HubFilter; label: string }[] = [
    { id: "all", label: t("chat.filterAll") },
    { id: "unread", label: t("chat.filterUnread") },
    { id: "favorites", label: t("chat.filterFavorites") },
    { id: "archived", label: t("chat.filterArchived") },
  ];

  return (
    <div className="dm-page-frame">
      {!online ? (
        <p className="mb-3 rounded-xl bg-dm-danger/10 px-3 py-2 text-sm text-dm-danger" role="status">
          {t("chat.offline")}
        </p>
      ) : null}
      {reconnecting ? (
        <p className="mb-3 rounded-xl bg-dm-blush px-3 py-2 text-sm text-dm-primary" role="status">
          {t("chat.reconnecting")}
        </p>
      ) : null}
      {safetyNote ? (
        <p className="mb-3 rounded-xl bg-dm-surface px-3 py-2 text-sm text-dm-primary" role="status">
          {safetyNote}
        </p>
      ) : null}

      <div className="grid min-h-[min(70dvh,720px)] gap-3 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,280px)]">
        {/* Hub */}
        <aside
          className={cn(
            "flex flex-col overflow-hidden rounded-[20px] border border-dm-line bg-dm-surface shadow-[0_12px_40px_rgba(36,26,28,0.06)]",
            mobilePane !== "list" && "hidden lg:flex",
          )}
        >
          <div className="border-b border-dm-line p-4">
            <h1 className="font-display text-2xl font-semibold text-dm-ink">
              {t("chat.title")}
            </h1>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("chat.searchPh")}
              className="mt-3 min-h-10 w-full rounded-xl border border-dm-line bg-white px-3 text-sm outline-none focus:border-dm-primary"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hubFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHubFilter(f.id)}
                  className={cn(
                    "min-h-8 rounded-full px-3 text-xs font-semibold",
                    hubFilter === f.id
                      ? "bg-dm-primary text-white"
                      : "bg-dm-blush text-dm-primary",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {filteredMatches.length === 0 ? (
              <li>
                <EmptyState
                  className="border-0 bg-transparent shadow-none"
                  title={t("chat.emptyTitle")}
                  description={t("chat.emptyBody")}
                  action={
                    <Link href="/discover">
                      <Button type="button" size="sm" variant="secondary">
                        {t("nav.discover")}
                      </Button>
                    </Link>
                  }
                />
              </li>
            ) : null}
            {filteredMatches.map((m) => (
              <li key={m.match_id}>
                <button
                  type="button"
                  disabled={!m.conversation_id}
                  onClick={() =>
                    m.conversation_id && selectConversation(m.conversation_id)
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                    m.conversation_id === activeConversationId
                      ? "bg-dm-blush"
                      : "hover:bg-dm-panel",
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dm-primary/15 font-display text-sm font-semibold text-dm-primary">
                    {initials(m.peer_name) || "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-dm-ink">
                        {m.peer_name}
                      </span>
                      <span className="shrink-0 text-[10px] text-dm-muted">
                        {formatTime(m.last_message_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dm-muted">
                      {m.last_message === "[media]"
                        ? t("chat.mediaSnippet")
                        : m.last_message || t("chat.noPreview")}
                    </span>
                  </span>
                  {(m.unread_count ?? 0) > 0 ? (
                    <span className="mt-1 rounded-full bg-dm-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      {m.unread_count}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Thread */}
        <section
          className={cn(
            "flex flex-col overflow-hidden rounded-[20px] border border-dm-line bg-dm-surface shadow-[0_12px_40px_rgba(36,26,28,0.06)]",
            mobilePane !== "thread" && "hidden lg:flex",
          )}
        >
          {activeConversationId && activePeer ? (
            <>
              <header className="flex items-center justify-between gap-2 border-b border-dm-line px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="lg:hidden text-sm font-semibold text-dm-primary"
                    onClick={() => setMobilePane("list")}
                  >
                    ←
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-dm-ink">
                      {activePeer.peer_name}
                    </p>
                    <p className="text-xs text-dm-muted">
                      {online ? t("chat.statusActive") : t("chat.offline")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled
                    title={t("chat.callsSoon")}
                  >
                    {t("chat.voiceSoon")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled
                    title={t("chat.callsSoon")}
                  >
                    {t("chat.videoSoon")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setAiOpen(true)}
                  >
                    {t("chat.aiTips")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="lg:hidden"
                    onClick={() => setMobilePane("context")}
                  >
                    {t("chat.context")}
                  </Button>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {error ? (
                  <p className="text-sm text-dm-danger" role="alert">
                    {error}
                  </p>
                ) : null}
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-dm-muted">
                    {t("chat.emptySelect")}
                  </p>
                ) : null}
                {messages.map((m) => {
                  const mine = m.sender_id === userId;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        mine
                          ? "ml-auto bg-dm-primary text-white"
                          : "mr-auto bg-dm-panel text-dm-ink",
                      )}
                    >
                      {m.media_url ? (
                        m.media_content_type?.startsWith("video/") ? (
                          <video
                            src={m.media_url}
                            controls
                            className="mb-2 max-h-56 rounded-lg"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.media_url}
                            alt=""
                            className="mb-2 max-h-56 rounded-lg object-cover"
                          />
                        )
                      ) : null}
                      {m.body ? (
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {m.body}
                        </p>
                      ) : null}
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          mine ? "text-white/70" : "text-dm-muted",
                        )}
                      >
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <footer className="border-t border-dm-line p-3">
                <form
                  onSubmit={(e) => void sendMessage(e)}
                  className="flex items-end gap-2"
                >
                  <div className="relative">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAttachOpen((v) => !v)}
                      disabled={uploading || !online}
                    >
                      +
                    </Button>
                    {attachOpen ? (
                      <div className="absolute bottom-12 left-0 z-10 w-48 rounded-xl border border-dm-line bg-white p-2 shadow-lg">
                        <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-dm-blush">
                          {t("chat.attachPhoto")}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) =>
                              void sendMedia(e.target.files?.[0] ?? null)
                            }
                          />
                        </label>
                        <Link
                          href="/places/map"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-dm-blush"
                        >
                          {t("chat.attachDateInvite")}
                        </Link>
                        <p className="px-3 py-1 text-[10px] text-dm-muted">
                          {t("chat.videoCapHint")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("chat.composerPlaceholder")}
                    disabled={!online || sending}
                    className="min-h-11 flex-1 rounded-xl border border-dm-line bg-white px-3 text-sm outline-none focus:border-dm-primary"
                    aria-label={t("chat.composerAria")}
                  />
                  <Button
                    type="submit"
                    disabled={!text.trim() || sending || !online}
                  >
                    {uploading ? t("chat.mediaUploading") : t("chat.send")}
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                title={t("chat.emptySelect")}
                description={t("chat.subtitle")}
              />
            </div>
          )}
        </section>

        {/* Context */}
        <aside
          className={cn(
            "flex flex-col overflow-hidden rounded-[20px] border border-dm-line bg-dm-surface shadow-[0_12px_40px_rgba(36,26,28,0.06)]",
            mobilePane !== "context" && "hidden lg:flex",
          )}
        >
          {activePeer ? (
            <>
              <div className="border-b border-dm-line p-3 lg:hidden">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setMobilePane("thread")}
                >
                  ← {t("chat.backToChat")}
                </Button>
              </div>
              <div className="flex gap-1 border-b border-dm-line p-2">
                {(
                  [
                    ["profile", t("chat.tabProfile")],
                    ["common", t("chat.tabCommon")],
                    ["memories", t("chat.tabMemories")],
                    ["dates", t("chat.tabDates")],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContextTab(id)}
                    className={cn(
                      "min-h-9 flex-1 rounded-lg px-1 text-[11px] font-semibold",
                      contextTab === id
                        ? "bg-dm-primary text-white"
                        : "text-dm-muted hover:bg-dm-blush",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {contextTab === "profile" ? (
                  <>
                    <div className="relative mx-auto h-36 w-full overflow-hidden rounded-2xl bg-dm-blush">
                      {peer?.avatarUrl ? (
                        <Image
                          src={peer.avatarUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="300px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-3xl text-dm-primary/40">
                          {initials(activePeer.peer_name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-dm-ink">
                        {peer?.displayName ?? activePeer.peer_name}
                      </h2>
                      <p className="text-sm text-dm-muted">
                        {peer?.region || activePeer.peer_region || t("chat.regionUnknown")}
                        {peer?.jobTitle || activePeer.peer_job
                          ? ` · ${peer?.jobTitle || activePeer.peer_job}`
                          : ""}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-dm-ink">
                      {peer?.bio || t("chat.noBio")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(peer?.interests ?? []).slice(0, 8).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-dm-blush px-2 py-0.5 text-[10px] font-semibold text-dm-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
                {contextTab === "common" ? (
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold text-dm-ink">
                      {t("chat.commonTitle")}
                    </h3>
                    {(peer?.shared.interests.length ||
                      peer?.shared.values.length ||
                      peer?.shared.goals.length) ? (
                      <ul className="space-y-2 text-sm text-dm-ink">
                        {peer?.shared.interests.map((x) => (
                          <li key={`i-${x}`}>✓ {x}</li>
                        ))}
                        {peer?.shared.values.map((x) => (
                          <li key={`v-${x}`}>✓ {x}</li>
                        ))}
                        {peer?.shared.goals.map((x) => (
                          <li key={`g-${x}`}>✓ {x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-dm-muted">{t("chat.commonEmpty")}</p>
                    )}
                  </div>
                ) : null}
                {contextTab === "memories" ? (
                  <p className="text-sm text-dm-muted">{t("chat.memoriesPrivate")}</p>
                ) : null}
                {contextTab === "dates" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-dm-muted">{t("chat.dateInviteHint")}</p>
                    <Link href="/places/map">
                      <Button type="button" className="w-full">
                        {t("chat.scheduleDate")}
                      </Button>
                    </Link>
                    <Link href="/couple">
                      <Button type="button" variant="outline" className="w-full">
                        {t("chat.inviteCouple")}
                      </Button>
                    </Link>
                  </div>
                ) : null}

                <div className="space-y-2 border-t border-dm-line pt-4">
                  {activePeer.match_id ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleFav(activePeer.match_id)}
                      >
                        {favorites.includes(activePeer.match_id)
                          ? t("chat.unfavorite")
                          : t("chat.favorite")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="w-full"
                        onClick={() => toggleArch(activePeer.match_id)}
                      >
                        {archived.includes(activePeer.match_id)
                          ? t("chat.unarchive")
                          : t("chat.archive")}
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setReportOpen(true)}
                  >
                    {t("chat.report")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    className="w-full"
                    onClick={() => void blockPeer()}
                  >
                    {t("chat.block")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-sm text-dm-muted">
              {t("chat.contextEmpty")}
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t("chat.reportTitle")}
      >
        <p className="mb-3 text-sm text-dm-muted">{t("chat.reportBody")}</p>
        <Textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder={t("chat.reportPlaceholder")}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={() => void submitReport()}>
            {t("chat.reportSubmit")}
          </Button>
        </div>
      </Modal>

      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title={t("chat.aiTipsTitle")}
      >
        <p className="mb-2 text-sm text-dm-muted">{t("chat.aiTipsBody")}</p>
        <label className="mb-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={aiConsent}
            onChange={(e) => setAiConsent(e.target.checked)}
            className="mt-1"
          />
          <span>{t("chat.aiConsent")}</span>
        </label>
        <Button
          type="button"
          disabled={!aiConsent || aiLoading}
          onClick={() => void loadAiTips()}
        >
          {aiLoading ? t("chat.aiLoading") : t("chat.aiGenerate")}
        </Button>
        <ul className="mt-4 space-y-2">
          {aiTips.map((tip) => (
            <li key={tip.title}>
              <button
                type="button"
                className="w-full rounded-xl border border-dm-line bg-dm-panel px-3 py-2 text-left text-sm hover:border-dm-primary"
                onClick={() => {
                  setText(tip.body);
                  setAiOpen(false);
                  setMobilePane("thread");
                }}
              >
                <p className="font-semibold text-dm-ink">{tip.title}</p>
                <p className="text-dm-muted">{tip.body}</p>
                <p className="mt-1 text-[10px] text-dm-champagne">
                  {t("chat.aiInsertHint")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
