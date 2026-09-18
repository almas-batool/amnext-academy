// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body   = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpiry: { gte: new Date() } },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired reset token" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordHash, resetToken: null, resetExpiry: null },
  });

  return NextResponse.json({ message: "Password reset successfully. You can now log in." });
}

