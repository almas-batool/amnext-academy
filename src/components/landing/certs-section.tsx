// src/components/landing/certs-section.tsx — server component

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export async function CertsSection() {
  const certs = await prisma.certification.findMany({
    where: { status: "PUBLISHED" },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <section id="certifications" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2">Popular Certifications</h2>
            <p className="text-muted-foreground">
              Industry-recognised credentials to advance your career
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 hidden md:flex">
            <Link href="/certifications">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert) => (
            <Link key={cert.id} href={`/certifications/${cert.id}`}>
              <div className="rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden group">
                {cert.thumbnail && (
                  <img
                    src={cert.thumbnail}
                    alt={cert.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{cert.category}</Badge>
                    <Badge
                      variant={
                        cert.difficulty === "BEGINNER"
                          ? "success"
                          : cert.difficulty === "INTERMEDIATE"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {cert.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {cert.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(Number(cert.price), cert.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cert._count.enrollments} students
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

