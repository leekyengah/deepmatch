import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServiceClient } from "@/lib/supabase/route";
import {
  getStorageBackend,
  PRESIGN_GET_TTL_SECONDS,
  PRESIGN_PUT_TTL_SECONDS,
  type StorageBackend,
} from "./limits";

export type UploadIntentPayload = {
  backend: StorageBackend;
  method: "PUT";
  url: string | null;
  path: string;
  token: string | null;
  headers: Record<string, string>;
  expires_in: number;
};

function cleanEnv(v: string | undefined): string {
  return (v ?? "").replace(/^\uFEFF/, "").trim();
}

function r2Config() {
  const endpoint = cleanEnv(process.env.R2_ENDPOINT).replace(/\/$/, "");
  const bucket = cleanEnv(process.env.R2_BUCKET);
  const accessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
  const region = cleanEnv(process.env.R2_REGION) || "auto";
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials missing");
  }
  return { endpoint, bucket, accessKeyId, secretAccessKey, region };
}

let cachedR2: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedR2) return cachedR2;
  const cfg = r2Config();
  cachedR2 = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    forcePathStyle: true,
  });
  return cachedR2;
}

export function getR2Bucket(): string {
  return r2Config().bucket;
}

export async function createUploadIntent(input: {
  storagePath: string;
  contentType: string;
  backend?: StorageBackend;
}): Promise<UploadIntentPayload> {
  const backend = input.backend ?? getStorageBackend();

  if (backend === "r2") {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: input.storagePath,
      ContentType: input.contentType,
    });
    const url = await getSignedUrl(client, cmd, {
      expiresIn: PRESIGN_PUT_TTL_SECONDS,
    });
    return {
      backend: "r2",
      method: "PUT",
      url,
      path: input.storagePath,
      token: null,
      headers: { "Content-Type": input.contentType },
      expires_in: PRESIGN_PUT_TTL_SECONDS,
    };
  }

  const admin = createServiceClient();
  const { data: signed, error } = await admin.storage
    .from("media")
    .createSignedUploadUrl(input.storagePath);
  if (error || !signed) {
    throw new Error(error?.message ?? "supabase_signed_upload_failed");
  }
  return {
    backend: "supabase",
    method: "PUT",
    url: signed.signedUrl ?? null,
    path: signed.path,
    token: signed.token,
    headers: { "Content-Type": input.contentType },
    expires_in: PRESIGN_PUT_TTL_SECONDS,
  };
}

export async function headObject(
  storagePath: string,
  backend: StorageBackend,
): Promise<{ size: number; contentType: string | null }> {
  if (backend === "r2") {
    const out = await getR2Client().send(
      new HeadObjectCommand({ Bucket: getR2Bucket(), Key: storagePath }),
    );
    return {
      size: Number(out.ContentLength ?? 0),
      contentType: out.ContentType ?? null,
    };
  }
  const admin = createServiceClient();
  const folder = storagePath.includes("/")
    ? storagePath.split("/").slice(0, -1).join("/")
    : "";
  const { data, error } = await admin.storage.from("media").list(folder, {
    search: storagePath.split("/").pop(),
    limit: 1,
  });
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) throw new Error("object_missing");
  const meta = (row.metadata ?? {}) as { size?: number; mimetype?: string };
  return {
    size: Number(meta.size ?? 0),
    contentType: meta.mimetype ?? null,
  };
}

export async function getObjectBytes(
  storagePath: string,
  backend: StorageBackend,
  maxBytes = 12 * 1024 * 1024,
): Promise<Uint8Array> {
  if (backend === "r2") {
    const out = await getR2Client().send(
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: storagePath }),
    );
    const body = out.Body;
    if (!body) throw new Error("empty_body");
    const ab = await body.transformToByteArray();
    if (ab.byteLength > maxBytes) throw new Error("object_too_large_for_process");
    return ab;
  }
  const admin = createServiceClient();
  const { data, error } = await admin.storage.from("media").download(storagePath);
  if (error || !data) throw new Error(error?.message ?? "download_failed");
  const ab = new Uint8Array(await data.arrayBuffer());
  if (ab.byteLength > maxBytes) throw new Error("object_too_large_for_process");
  return ab;
}

export async function putObjectBytes(input: {
  storagePath: string;
  backend: StorageBackend;
  bytes: Uint8Array;
  contentType: string;
}): Promise<void> {
  if (input.backend === "r2") {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: input.storagePath,
        Body: input.bytes,
        ContentType: input.contentType,
      }),
    );
    return;
  }
  const admin = createServiceClient();
  const { error } = await admin.storage
    .from("media")
    .upload(input.storagePath, input.bytes, {
      contentType: input.contentType,
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

export async function deleteObject(
  storagePath: string,
  backend: StorageBackend,
): Promise<void> {
  if (backend === "r2") {
    await getR2Client().send(
      new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: storagePath }),
    );
    return;
  }
  const admin = createServiceClient();
  await admin.storage.from("media").remove([storagePath]);
}

export async function createSignedReadUrl(
  storagePath: string,
  backend: StorageBackend,
  expiresIn = PRESIGN_GET_TTL_SECONDS,
): Promise<string | null> {
  if (backend === "r2") {
    return getSignedUrl(
      getR2Client(),
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: storagePath }),
      { expiresIn },
    );
  }
  const admin = createServiceClient();
  const { data, error } = await admin.storage
    .from("media")
    .createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function pingR2(): Promise<{ ok: boolean; error?: string }> {
  try {
    await getR2Client().send(new HeadBucketCommand({ Bucket: getR2Bucket() }));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "r2_ping_failed",
    };
  }
}

export async function ensureR2Cors(origins: string[]): Promise<void> {
  const allowed = origins.filter(Boolean);
  if (!allowed.length) return;
  await getR2Client().send(
    new PutBucketCorsCommand({
      Bucket: getR2Bucket(),
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: allowed,
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
}
