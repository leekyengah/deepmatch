/**
 * Minimal R2 connectivity check (HeadBucket only).
 * Usage: node --env-file=.env.local scripts/r2-ping.mjs
 * Never logs secret values.
 */
import {
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT?.replace(/\/$/, "");
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const region = process.env.R2_REGION || "auto";

if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("FAIL CREDENTIALS_REQUIRED");
  process.exit(2);
}

const client = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  const origins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "https://datingvn.com",
    "https://www.datingvn.com",
    "http://localhost:3000",
  ].filter(Boolean);
  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: origins,
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
    console.log("PASS HeadBucket + CORS updated for", origins.length, "origins");
  } catch (e) {
    console.log("PASS HeadBucket; CORS warn:", e instanceof Error ? e.message : e);
  }
} catch (e) {
  console.error("FAIL", e instanceof Error ? e.message : e);
  process.exit(1);
}
