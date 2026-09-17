import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();

    const courses: Record<string, { name: string; price: number }> = {
      "1": {
        name: "Full-Stack Web Development",
        price: 49,
      },
      "2": {
        name: "Generative AI & LLM Engineering",
        price: 59,
      },
      "3": {
        name: "Python for Data Science",
        price: 39,
      },
      "4": {
        name: "Cloud Engineering Foundations",
        price: 49,
      },
      "5": {
        name: "Cybersecurity Fundamentals",
        price: 45,
      },
      "6": {
        name: "Advanced TypeScript",
        price: 35,
      },
    };

    const course = courses[String(courseId)];

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured yet." },
        { status: 500 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.name,
              description: "AMNext Academy online course",
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/course/full-stack-web-development?payment=cancelled`,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
