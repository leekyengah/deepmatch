export type UploadIntentResponse = {
  media_id: string;
  storage_path: string;
  backend?: "supabase" | "r2";
  upload?: {
    path?: string;
    token?: string | null;
    url?: string | null;
    method?: string;
    headers?: Record<string, string>;
    signed_url?: string;
  } | null;
  note?: string;
};

export async function uploadWithIntent(
  intent: UploadIntentResponse,
  file: File,
  supabaseUpload: (args: {
    path: string;
    token: string;
    file: File;
    contentType: string;
  }) => Promise<{ error: Error | null }>,
): Promise<{ error: string | null }> {
  const upload = intent.upload;
  if (!upload) return { error: intent.note ?? "upload_unavailable" };

  const backend = intent.backend ?? (upload.token ? "supabase" : "r2");

  if (backend === "r2" || (upload.url && !upload.token)) {
    if (!upload.url) return { error: "missing_presigned_url" };
    const res = await fetch(upload.url, {
      method: upload.method ?? "PUT",
      headers: {
        "Content-Type": file.type,
        ...(upload.headers ?? {}),
      },
      body: file,
    });
    if (!res.ok) return { error: `upload_http_${res.status}` };
    return { error: null };
  }

  if (!upload.path || !upload.token) {
    return { error: "missing_supabase_token" };
  }
  const { error } = await supabaseUpload({
    path: upload.path,
    token: upload.token,
    file,
    contentType: file.type,
  });
  return { error: error?.message ?? null };
}

export async function confirmMedia(mediaId: string): Promise<{
  ok: boolean;
  error?: string;
  data?: {
    media_id: string;
    processing_status: string;
    storage_path: string;
    content_type: string;
  };
}> {
  const res = await fetch(`/api/v1/media/${mediaId}/confirm`, {
    method: "POST",
  });
  const json = (await res.json()) as {
    error?: { message?: string };
    data?: {
      media_id: string;
      processing_status: string;
      storage_path: string;
      content_type: string;
    };
  };
  if (!res.ok || !json.data) {
    return { ok: false, error: json.error?.message ?? "confirm_failed" };
  }
  return { ok: true, data: json.data };
}
