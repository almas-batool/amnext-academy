// ─────────────────────────────────────────────────────────────
//  src/app/api/auth/register/route.ts
//  POST /api/auth/register – create account + send verify email
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
//import { sendVerificationEmail } from "@/lib/services/email.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password, name, role } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    //const verifyToken = nanoid(32);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role as any,
        //verifyToken, (once verified change email verified below to false as now it is true)
        emailVerified: true,
        profile: {
          create: {
            xp: 0,
            level: 1,
            streak: 0,
          },
        },
      },
    });

    // Send verification email and log the result
    // try {
    // const result = await sendVerificationEmail(email, name, verifyToken);

    //console.log("✅ Verification email sent successfully");
    //console.log(result);
    //} catch (error) {
    //console.error("❌ Failed to send verification email:");
    //console.error(error);
    //}

    return NextResponse.json(
      {
        message: "Account created successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.error("[register]", err);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

