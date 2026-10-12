import { getActiveLocale, t } from "@deepmatch/i18n";
import type { ApiErrorBody } from "@deepmatch/shared";
import { supabase } from "./supabase";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://datingvn.com"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
  }
}

function messageFromBody(json: unknown, status: number): string {
  const err = (json as ApiErrorBody | null | undefined)?.error;
  if (err?.key) {
    const viaKey = t(getActiveLocale(), err.key);
    if (viaKey && !viaKey.startsWith("[missing:")) return viaKey;
  }
  if (err?.code) {
    const viaCode = t(getActiveLocale(), `errors.${err.code}`);
    if (viaCode && !viaCode.startsWith("[missing:")) return viaCode;
  }
  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message;
  }
  const legacy = json as { error?: string; message?: string };
  if (typeof legacy.message === "string") return legacy.message;
  if (typeof legacy.error === "string") return legacy.error;
  return t(getActiveLocale(), "errors.unknown") || `HTTP ${status}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: await authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(messageFromBody(json, res.status), res.status, json);
  }
  return json as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(messageFromBody(json, res.status), res.status, json);
  }
  return json as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(messageFromBody(json, res.status), res.status, json);
  }
  return json as T;
}

export type Candidate = {
  userId: string;
  score: number;
  displayName: string;
  fuzzyRegion: string;
  interests: string[];
  reasons?: string[];
};

export type MatchRow = {
  match_id: string;
  peer_id: string;
  peer_name: string;
  conversation_id: string | null;
  unread_count: number;
  created_at: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  body: string | null;
  media_url?: string | null;
  created_at: string;
};
