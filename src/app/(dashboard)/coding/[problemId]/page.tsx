// src/app/(dashboard)/coding/[problemId]/page.tsx
// Full-page coding problem editor.
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CodePanel } from "@/components/workspace/code-panel-old";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default async function ProblemPage({
  params,
}: {
  params: { problemId: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const problem = await prisma.codingProblem.findFirst({
    where: { OR: [{ id: params.problemId }, { slug: params.problemId }] },
  });
  if (!problem) redirect("/coding");

  const safeProblem = { ...problem, solution: undefined };

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left: Problem description */}
      <div className="w-[40%] border-r border-border flex flex-col min-w-0">
        <div className="p-4 border-b border-border shrink-0 flex items-center justify-between">
          <h1 className="font-semibold truncate">{problem.title}</h1>
          <Badge
            variant={
              problem.difficulty === "BEGINNER"
                ? "success"
                : problem.difficulty === "INTERMEDIATE"
                  ? "warning"
                  : "destructive"
            }
          >
            {problem.difficulty}
          </Badge>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 prose-AMNext Academy text-sm">
            <div
              dangerouslySetInnerHTML={{
                __html: problem.description.replace(/\n/g, "<br/>"),
              }}
            />
            {problem.constraints && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Constraints</h3>
                <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap">
                  {problem.constraints}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      {/* Right: Editor */}
      <div className="flex-1 min-w-0">
        <CodePanel problem={safeProblem as any} certId="" />
      </div>
    </div>
  );
}
