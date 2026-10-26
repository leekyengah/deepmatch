import { supabase } from "./supabase";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://datingvn.com"
).replace(/\/$/, "");

export type MobileUploadIntent = {
  media_id: string;
  storage_path: string;
  backend?: "supabase" | "r2";
  upload?: {
    path?: string;
    token?: string | null;
    url?: string | null;
    method?: string;
    headers?: Record<string, string>;
  } | null;
  note?: string;
};

async function authHeaders(json = true): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function uploadMobileMedia(input: {
  uri: string;
  mimeType: string;
  bytes?: number;
  purpose?: string;
  conversationId?: string;
  pairId?: string;
}): Promise<{ mediaId: string }> {
  const blobRes = await fetch(input.uri);
  const blob = await blobRes.blob();
  const bytes = input.bytes ?? blob.size;
  const contentType = input.mimeType || blob.type || "image/jpeg";

  const intentRes = await fetch(`${API_URL}/api/v1/media/upload-intents`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      content_type: contentType,
      bytes,
      purpose: input.purpose,
      conversation_id: input.conversationId,
      pair_id: input.pairId,
    }),
  });
  const intentJson = (await intentRes.json()) as {
    error?: { message?: string };
    data?: MobileUploadIntent;
  };
  if (!intentRes.ok || !intentJson.data?.upload) {
    throw new Error(
      intentJson.error?.message ??
        intentJson.data?.note ??
        "upload_intent_failed",
    );
  }

  const upload = intentJson.data.upload;
  const backend =
    intentJson.data.backend ?? (upload.token ? "supabase" : "r2");

  if (backend === "r2" || (upload.url && !upload.token)) {
    if (!upload.url) throw new Error("missing_presigned_url");
    const put = await fetch(upload.url, {
      method: upload.method ?? "PUT",
      headers: {
        "Content-Type": contentType,
        ...(upload.headers ?? {}),
      },
      body: blob,
    });
    if (!put.ok) throw new Error(`upload_http_${put.status}`);
  } else {
    if (!upload.path || !upload.token) {
      throw new Error("missing_supabase_token");
    }
    const { error } = await supabase.storage
      .from("media")
      .uploadToSignedUrl(upload.path, upload.token, blob, {
        contentType,
      });
    if (error) throw new Error(error.message);
  }

  const confirmRes = await fetch(
    `${API_URL}/api/v1/media/${intentJson.data.media_id}/confirm`,
    {
      method: "POST",
      headers: await authHeaders(),
    },
  );
  const confirmJson = (await confirmRes.json()) as {
    error?: { message?: string };
    data?: { media_id: string };
  };
  if (!confirmRes.ok || !confirmJson.data) {
    throw new Error(confirmJson.error?.message ?? "confirm_failed");
  }
  return { mediaId: confirmJson.data.media_id };
}
