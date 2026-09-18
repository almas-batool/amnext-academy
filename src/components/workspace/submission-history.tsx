//src/components/workspace/submission-history.tsx

"use client";

import { CheckCircle2, XCircle, Clock3, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export interface SubmissionHistoryItem {
  id: string;

  language: string;

  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "RUNTIME_ERROR"
    | "COMPILE_ERROR"
    | "TIME_LIMIT"
    | "PENDING";

  runtime?: number;

  memory?: number;

  createdAt: string;
}

interface Props {
  submissions: SubmissionHistoryItem[];
}

function StatusIcon(status: SubmissionHistoryItem["status"]) {
  switch (status) {
    case "ACCEPTED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;

    case "WRONG_ANSWER":
      return <XCircle className="h-4 w-4 text-red-500" />;

    case "RUNTIME_ERROR":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;

    case "COMPILE_ERROR":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;

    case "TIME_LIMIT":
      return <Clock3 className="h-4 w-4 text-purple-500" />;

    default:
      return <Clock3 className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge(status: SubmissionHistoryItem["status"]) {
  switch (status) {
    case "ACCEPTED":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
          Accepted
        </Badge>
      );

    case "WRONG_ANSWER":
      return <Badge variant="destructive">Wrong Answer</Badge>;

    case "RUNTIME_ERROR":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-500 text-white">
          Runtime Error
        </Badge>
      );

    case "COMPILE_ERROR":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
          Compile Error
        </Badge>
      );

    case "TIME_LIMIT":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-500 text-white">
          Time Limit
        </Badge>
      );

    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export function SubmissionHistory({ submissions }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        No submissions yet.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4">
        {submissions.map((submission) => (
          <Card
            key={submission.id}
            className="p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {StatusIcon(submission.status)}

                <div>
                  <p className="font-medium">
                    {submission.language.toUpperCase()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {StatusBadge(submission.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Runtime</p>

                <p className="font-medium">
                  {submission.runtime ? `${submission.runtime} ms` : "--"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Memory</p>

                <p className="font-medium">
                  {submission.memory ? `${submission.memory} KB` : "--"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

