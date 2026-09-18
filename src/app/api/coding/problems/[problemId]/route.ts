// src/app/api/coding/problems/[problemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { problemId: string } }
) {
  const problem = await prisma.codingProblem.findFirst({
    where: { OR: [{ id: params.problemId }, { slug: params.problemId }] },
  });

  if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip solution and sanitise hidden test cases
  const { solution, ...safe } = problem;
  const testCases = (safe.testCases as any[]).map((tc) => ({
    input:          tc.hidden ? "(hidden)" : tc.input,
    expectedOutput: tc.hidden ? "(hidden)" : tc.expectedOutput,
    hidden:         !!tc.hidden,
  }));

  return NextResponse.json({ data: { ...safe, testCases } });
}
