//src/app/api/admin/certifications/route.ts
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { certificationSchema } from "@/lib/validators/certification";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parsed = certificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = parsed.data;

    const exists = await prisma.certification.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (exists) {
      return NextResponse.json(
        {
          error: "Slug already exists",
        },
        {
          status: 400,
        },
      );
    }

    const certification = await prisma.certification.create({
      data: {
        instructorId: session.user.id,

        title: data.title,
        slug: data.slug,
        description: data.description,

        category: data.category,
        difficulty: data.difficulty,

        duration: data.durationHours,

        price: new Prisma.Decimal(data.price),

        currency: data.currency,

        thumbnail: data.thumbnailUrl,

        learningOutcomes: [],
        prerequisites: [],
        tags: [],
      },
    });

    return NextResponse.json(certification);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

