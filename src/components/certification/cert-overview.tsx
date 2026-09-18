// src/components/certification/cert-overview.tsx
// Server-friendly cert overview section (description + outcomes + prereqs)
import { CheckCircle2 } from "lucide-react";
import { Separator }    from "@/components/ui/separator";

interface Props {
  description:     string;
  longDescription?: string | null;
  outcomes:        string[];
  prerequisites:   string[];
}

export function CertOverview({ description, longDescription, outcomes, prerequisites }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground leading-relaxed">
          {longDescription ?? description}
        </p>
      </div>

      {outcomes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">What you'll learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prerequisites.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-3">Prerequisites</h2>
            <ul className="space-y-1.5">
              {prerequisites.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

