import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BookOpen,
  ClipboardCheck,
  Users,
  IndianRupee,
  Pencil,
  BarChart3,
  Rocket,
} from "lucide-react";

interface Props {
  params: {
    certId: string;
  };
}

export default async function CertificationDetailsPage({ params }: Props) {
  const session = await getAuthSession();

  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  const cert = await prisma.certification.findUnique({
    where: {
      id: params.certId,
    },
    include: {
      instructor: true,

      chapters: {
        orderBy: {
          order: "asc",
        },
      },

      assessments: true,

      _count: {
        select: {
          chapters: true,
          enrollments: true,
          assessments: true,
        },
      },
    },
  });

  if (!cert) {
    notFound();
  }

  const revenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },

    where: {
      certId: cert.id,
      status: "COMPLETED",
    },
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{cert.title}</h1>

          <p className="text-muted-foreground mt-1">{cert.category}</p>
        </div>

        <Badge>{cert.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/admin/certifications/${cert.id}/edit`}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </Button>

        <Button variant="secondary" asChild>
          <Link href={`/admin/certifications/${cert.id}/chapters`}>
            <BookOpen className="w-4 h-4 mr-2" />
            Chapters
          </Link>
        </Button>

        <Button variant="secondary" asChild>
          <Link href={`/admin/certifications/${cert.id}/assessments`}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Assessments
          </Link>
        </Button>

        <Button variant="secondary" asChild>
          <Link href={`/admin/certifications/${cert.id}/analytics`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="pt-6">
            <Users className="w-8 h-8 text-primary mb-3" />

            <h2 className="text-3xl font-bold">{cert._count.enrollments}</h2>

            <p className="text-muted-foreground">Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <BookOpen className="w-8 h-8 text-primary mb-3" />

            <h2 className="text-3xl font-bold">{cert._count.chapters}</h2>

            <p className="text-muted-foreground">Chapters</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ClipboardCheck className="w-8 h-8 text-primary mb-3" />

            <h2 className="text-3xl font-bold">{cert._count.assessments}</h2>

            <p className="text-muted-foreground">Assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <IndianRupee className="w-8 h-8 text-primary mb-3" />

            <h2 className="text-3xl font-bold">
              ${Number(revenue._sum.amount ?? 0).toLocaleString()}
            </h2>

            <p className="text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certification Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p>
            <strong>Description:</strong> {cert.description}
          </p>

          <p>
            <strong>Difficulty:</strong> {cert.difficulty}
          </p>

          <p>
            <strong>Price:</strong> ${Number(cert.price)}
          </p>

          <p>
            <strong>Duration:</strong> {cert.duration ?? 0} Hours
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
          </CardHeader>

          <CardContent>
            {cert.chapters.length === 0 ? (
              <p>No chapters yet.</p>
            ) : (
              cert.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex justify-between py-3 border-b"
                >
                  <span>
                    {chapter.order}. {chapter.title}
                  </span>

                  <Badge>{0} min</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
          </CardHeader>

          <CardContent>
            {cert.assessments.length === 0 ? (
              <p>No assessments.</p>
            ) : (
              cert.assessments.map((exam) => (
                <div
                  key={exam.id}
                  className="flex justify-between py-3 border-b"
                >
                  <span>{exam.title}</span>

                  <Badge>{exam.type}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Rocket className="mr-2 w-4 h-4" />
          Publish Certification
        </Button>
      </div>
    </div>
  );
}
