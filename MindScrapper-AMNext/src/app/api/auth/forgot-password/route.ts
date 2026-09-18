// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/services/email.service";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token  = nanoid(32);
    const expiry = new Date(Date.now() + 3_600_000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetExpiry: expiry },
    });

    sendPasswordResetEmail(email, user.name ?? "User", token).catch(console.error);
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({
    message: "If that email is registered, a reset link has been sent.",
  });
}
