// ─────────────────────────────────────────────────────────────
//  src/lib/services/storage.service.ts
//  Cloudflare R2 / S3-compatible object storage operations.
// ─────────────────────────────────────────────────────────────

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ── Client ─────────────────────────────────────────────────────

const s3 = new S3Client({
  region:   "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET ?? "MindScrapper";

// ── Operations ─────────────────────────────────────────────────

/** Upload a buffer and return the public URL. */
export async function uploadToR2(
  key:         string,
  body:        Buffer | Uint8Array | string,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/** Generate a pre-signed URL for client-side upload. */
export async function getUploadPresignedUrl(
  key:         string,
  contentType: string,
  expiresIn =  3600
): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

/** Generate a pre-signed read URL for private objects. */
export async function getReadPresignedUrl(
  key:      string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}

/** Delete an object from R2. */
export async function deleteFromR2(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
