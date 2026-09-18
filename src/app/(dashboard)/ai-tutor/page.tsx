// src/app/(dashboard)/ai-tutor/page.tsx
// Standalone AI Tutor page (not in workspace).
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AIChatPanel } from "@/components/workspace/ai-chat-panel";

export const metadata = { title: "AI Tutor" };

export default async function AITutorPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-muted-foreground mt-1">Ask anything about your courses or programming concepts</p>
      </div>
      <div className="rounded-xl border border-border overflow-hidden h-[calc(100%-5rem)]">
        <AIChatPanel />
      </div>
    </div>
  );
}

