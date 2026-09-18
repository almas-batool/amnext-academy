// src/app/api/coding/run/route.ts  – single code execution (no submission)
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession }   from "@/lib/auth";
import { executeCode }      from "@/lib/services/piston.service";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { language, code, stdin } = await req.json();
  if (!language || !code)
    return NextResponse.json({ error: "language and code are required" }, { status: 400 });

  const result = await executeCode(language, code, stdin);
  return NextResponse.json({ data: result });
}

