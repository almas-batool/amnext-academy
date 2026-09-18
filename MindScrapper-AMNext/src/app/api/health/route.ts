// ─────────────────────────────────────────────────────────────
//  src/app/api/health/route.ts
//  Simple health check — used by Vercel/uptime monitors.
//  Verifies the app is up and the database is reachable.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status:    "ok",
      database:  "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status:    "error",
        database:  "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
