// src/app/api/coding/submit/route.ts – evaluate against all test cases
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runTestCases } from "@/lib/services/piston.service";
import { awardXP } from "@/lib/services/gamification.service";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { problemId, code, language } = await req.json();
  if (!problemId || !code || !language)
    return NextResponse.json(
      { error: "problemId, code, language required" },
      { status: 400 },
    );

  const problem = await prisma.codingProblem.findUnique({
    where: { id: problemId },
  });
  if (!problem)
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const testCases = problem.testCases as Array<{
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;

  const { passed, total, results } = await runTestCases(
    language,
    code,
    testCases,
  );

  const prismaResults = JSON.parse(
    JSON.stringify(results),
  ) as Prisma.InputJsonValue;
  const allPassed = passed === total;
  const status = allPassed ? "ACCEPTED" : "WRONG_ANSWER";

  const submission = await prisma.submission.create({
    data: {
      userId: session.user.id,
      problemId,
      code,
      language,
      status,
      results: prismaResults,
    },
  });

  // XP only on first-time acceptance
  if (allPassed) {
    const prevAccepted = await prisma.submission.count({
      where: {
        userId: session.user.id,
        problemId,
        status: "ACCEPTED",
        id: { not: submission.id },
      },
    });
    if (prevAccepted === 0) {
      const reason =
        problem.difficulty === "BEGINNER"
          ? "coding_beginner"
          : problem.difficulty === "INTERMEDIATE"
            ? "coding_intermediate"
            : "coding_advanced";
      await awardXP(session.user.id, reason as any, { problemId });
    }
  }

  return NextResponse.json({
    data: { submission, passed, total, results, status },
  });
}

