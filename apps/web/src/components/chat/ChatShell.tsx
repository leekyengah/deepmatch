"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/components/ui/cn";

type MatchRow = {
  match_id: string;
  conversation_id: string | null;
  peer_id?: string;
  peer_name: string;
  unread_count?: number;
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

export function ChatShell({ chatEnabled }: { chatEnabled: boolean }) {
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    const json = (await res.json()) as {
      data?: {
        matches?: Array<{
          match_id: string;
          peer_id?: string;
          peer_name?: string;
          conversation_id: string | null;
          unread_count?: number;
        }>;
      };
    };
    const mapped: MatchRow[] = (json.data?.matches ?? []).map((m) => ({
      match_id: m.match_id,
      conversation_id: m.conversation_id,
      peer_id: m.peer_id,
      peer_name: m.peer_name ?? t("chat.peerDefault"),
      unread_count: m.unread_count ?? 0,
    }));
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
    if (!activeConversationId || !chatEnabled) return;

    let cancelled = false;
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
      }
      await fetch("/api/v1/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: activeConversationId }),
      });
      if (!cancelled) await loadMatches();
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
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [activeConversationId, chatEnabled, supabase, loadMatches, t]);

  const activePeer = matches.find(
    (m) => m.conversation_id === activeConversationId,
  );

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
    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      setSafetyNote(resolveApiErrorMessage(json, t, "chat.blockFailed"));
      return;
    }
    setSafetyNote(t("chat.blocked"));
    setActiveConversationId(null);
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
    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      setSafetyNote(resolveApiErrorMessage(json, t, "chat.reportFailed"));
      setReportOpen(false);
      return;
    }
    setReportOpen(false);
    setReportReason("");
    setSafetyNote(t("chat.reportSent"));
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConversationId || !text.trim() || sending) return;
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
      const max = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
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
        data?: {
          media_id: string;
          upload?: { path: string; token: string } | null;
          note?: string;
        };
      };
      if (!intentRes.ok || !intent.data?.upload) {
        setError(
          resolveApiErrorMessage(intent, t, "chat.mediaUploadFailed") ||
            intent.data?.note ||
            t("chat.mediaUploadFailed"),
        );
        return;
      }
      const { error: upErr } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(
          intent.data.upload.path,
          intent.data.upload.token,
          file,
          { contentType: file.type },
        );
      if (upErr) {
        setError(upErr.message);
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
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? t("chat.mediaSendFailed"));
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

  if (!chatEnabled) {
    return (
      <ErrorState
        title={t("chat.flagOffTitle")}
        description={t("chat.flagOffBody")}
      />
    );
  }

  if (loading) {
    return <LoadingState label={t("chat.loading")} />;
  }

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

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("chat.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("chat.heading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("chat.subtitle")}</p>

      <div className="mt-6 flex min-h-[480px] flex-col gap-4 md:flex-row">
        <aside className="w-full shrink-0 rounded-dm-lg border border-dm-line bg-dm-panel p-3 shadow-dm md:w-72">
          <ul className="space-y-1">
            {matches.length === 0 && (
              <li>
                <EmptyState
                  className="border-0 bg-transparent px-2 py-6 shadow-none"
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
            )}
            {matches.map((m) => (
              <li key={m.match_id}>
                <button
                  type="button"
                  disabled={!m.conversation_id}
                  onClick={() =>
                    m.conversation_id && setActiveConversationId(m.conversation_id)
                  }
                  className={cn(
                    "w-full rounded-dm px-3 py-2.5 text-left text-sm font-medium transition disabled:opacity-40",
                    activeConversationId === m.conversation_id
                      ? "bg-dm-primary text-white"
                      : "hover:bg-dm-surface text-dm-ink",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{m.peer_name}</span>
                    {(m.unread_count ?? 0) > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-xs font-bold",
                          activeConversationId === m.conversation_id
                            ? "bg-white/20 text-white"
                            : "bg-dm-primary text-white",
                        )}
                      >
                        {m.unread_count}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-h-[420px] flex-1 flex-col rounded-dm-lg border border-dm-line bg-dm-panel shadow-dm">
          {!activeConversationId ? (
            <p className="m-auto px-6 text-center text-sm text-dm-muted">
              {t("chat.emptySelect")}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dm-line px-4 py-2">
                <p className="text-sm font-semibold text-dm-raspberry">
                  {activePeer?.peer_name ?? t("chat.peerDefault")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setReportOpen(true)}
                  >
                    {t("chat.report")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => void blockPeer()}
                  >
                    {t("chat.block")}
                  </Button>
                  <Link href="/couple/invite">
                    <Button type="button" size="sm" variant="secondary">
                      {t("chat.inviteCouple")}
                    </Button>
                  </Link>
                </div>
              </div>
              {safetyNote ? (
                <p className="px-4 pt-2 text-sm text-dm-muted" role="status">
                  {safetyNote}
                </p>
              ) : null}
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {messages.map((m) => {
                  const mine = m.sender_id === userId;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-[14px] px-3 py-2 text-sm leading-relaxed",
                          mine
                            ? "rounded-br-sm bg-dm-primary text-white"
                            : "rounded-bl-sm bg-dm-surface text-dm-ink",
                        )}
                      >
                        {m.media_url ? (
                          m.media_content_type?.startsWith("video/") ? (
                            <video
                              src={m.media_url}
                              controls
                              className="mb-1 max-h-56 rounded-lg"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.media_url}
                              alt={t("chat.attachmentAlt")}
                              className="mb-1 max-h-56 rounded-lg"
                            />
                          )
                        ) : null}
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>
              {error ? (
                <p className="px-4 text-sm text-dm-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <form
                onSubmit={sendMessage}
                className="flex flex-wrap items-center gap-2 border-t border-dm-line p-3"
              >
                <label className="inline-flex cursor-pointer items-center rounded-dm border border-dm-line px-3 py-2 text-sm font-medium text-dm-raspberry hover:bg-dm-surface">
                  <span className="sr-only">{t("chat.mediaAria")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      void sendMedia(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  {uploading ? t("chat.mediaUploading") : t("chat.media")}
                </label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("chat.composerPlaceholder")}
                  maxLength={2000}
                  aria-label={t("chat.composerAria")}
                  className="min-w-[12rem] flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !text.trim()}
                  variant="primary"
                >
                  {t("chat.send")}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>

      <Modal
        open={reportOpen}
        title={t("chat.reportTitle")}
        onClose={() => setReportOpen(false)}
      >
        <p className="mb-3 text-sm text-dm-muted">{t("chat.reportBody")}</p>
        <Textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          rows={3}
          placeholder={t("chat.reportPlaceholder")}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setReportOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!reportReason.trim()}
            onClick={() => void submitReport()}
          >
            {t("chat.reportSubmit")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
