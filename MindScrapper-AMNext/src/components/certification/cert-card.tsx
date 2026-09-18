// src/components/certification/cert-card.tsx
import Link  from "next/link";
import Image from "next/image";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CertCardProps {
  cert: {
    id:          string;
    title:       string;
    description: string;
    category:    string;
    difficulty:  string;
    price:       number;
    currency:    string;
    thumbnail?:  string | null;
    totalChapters: number;
    duration?:   number | null;
    _count?:     { enrollments: number };
  };
}

const diffVariant = (d: string) =>
  d === "BEGINNER" ? "success" as const :
  d === "INTERMEDIATE" ? "warning" as const : "destructive" as const;

export function CertCard({ cert }: CertCardProps) {
  return (
    <Link href={`/certifications/${cert.id}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer overflow-hidden group">
        {cert.thumbnail ? (
          <div className="relative h-44 overflow-hidden">
            <img
              src={cert.thumbnail}
              alt={cert.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge variant="secondary" className="text-xs">{cert.category}</Badge>
            <Badge variant={diffVariant(cert.difficulty)} className="text-xs">
              {cert.difficulty}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {cert.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
            {cert.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {cert.totalChapters} chapters
            </span>
            {cert.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {cert.duration}h
              </span>
            )}
            {cert._count && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {cert._count.enrollments.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">
              {Number(cert.price) === 0
                ? <span className="text-emerald-400">Free</span>
                : formatCurrency(Number(cert.price), cert.currency)}
            </span>
            <span className="text-xs text-primary font-medium group-hover:underline">
              View course →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
