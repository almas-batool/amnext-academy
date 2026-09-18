// ─────────────────────────────────────────────────────────────
//  src/app/api/uploads/route.ts
//  Returns a presigned R2 upload URL for client-side uploads.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession }            from "@/lib/auth";
import { getUploadPresignedUrl }     from "@/lib/services/storage.service";
import { nanoid }                    from "nanoid";

const ALLOWED_TYPES: Record<string, string[]> = {
  pdf:   ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp"],
};

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { filename, contentType, bucket = "pdf" } = await req.json();

  if (!filename || !contentType)
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });

  const allowed = ALLOWED_TYPES[bucket] ?? [];
  if (!allowed.includes(contentType))
    return NextResponse.json({ error: `contentType must be one of: ${allowed.join(", ")}` }, { status: 400 });

  const ext    = filename.split(".").pop() ?? "bin";
  const key    = `${bucket}/${session.user.id}/${nanoid(12)}.${ext}`;
  const url    = await getUploadPresignedUrl(key, contentType);
  const pubUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ data: { uploadUrl: url, publicUrl: pubUrl, key } });
}

