import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Payments are being configured. Please try again later."
    },
    { status: 503 }
  );
}
