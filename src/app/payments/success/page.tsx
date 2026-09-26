import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/payments/stripe";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Payment successful" };
export const dynamic = "force-dynamic";

type PaymentSuccessPageProps = {
  searchParams: { session_id?: string };
};

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const sessionId = searchParams.session_id;
  let stripeSession: Awaited<ReturnType<Awaited<ReturnType<typeof getStripeClient>>["checkout"]["sessions"]["retrieve"]>> | null = null;
  if (sessionId && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    try {
      const stripe = await getStripeClient();
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("Unable to verify Stripe Checkout session:", error);
    }
  }

  const payment = stripeSession?.mode === "payment" && stripeSession.metadata?.certId && stripeSession.metadata?.userId
    ? await prisma.payment.findFirst({
        where: {
          gatewayId: stripeSession.id,
          gateway: "STRIPE",
          certId: stripeSession.metadata.certId,
          userId: stripeSession.metadata.userId,
        },
      })
    : null;
  const stripeConfirmed = stripeSession?.payment_status === "paid" && !!payment;
  const enrollment = stripeConfirmed && payment
    ? await prisma.enrollment.findUnique({
        where: { userId_certId: { userId: payment.userId, certId: payment.certId } },
        select: { id: true },
      })
    : null;
  const course = stripeConfirmed && payment
    ? await prisma.certification.findUnique({ where: { id: payment.certId }, select: { title: true } })
    : null;
  const pending = stripeSession?.payment_status === "unpaid" && !!payment;
  const displaySuccess = stripeConfirmed;
  const continueHref = payment
    ? enrollment
      ? `/certifications/${payment.certId}/learn`
      : `/certifications/${payment.certId}`
    : "/courses";
  const paidAmount = stripeSession?.amount_total != null
    ? formatCurrency(stripeSession.amount_total / 100)
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-xl shadow-violet-950/10 sm:p-10">
        {displaySuccess ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h1 className="mt-5 text-2xl font-bold">Payment Successful</h1>
            <p className="mt-2 text-muted-foreground">
              {course?.title ?? "Your course"} {enrollment
                ? "is ready in your learning dashboard."
                : "is confirmed. Your enrollment is syncing and will be available shortly."}
            </p>
            {paidAmount && <p className="mt-4 text-sm font-medium text-foreground">Paid {paidAmount} USD</p>}
          </>
        ) : pending ? (
          <>
            <Clock3 className="mx-auto h-12 w-12 text-amber-400" />
            <h1 className="mt-5 text-2xl font-bold">Payment processing</h1>
            <p className="mt-2 text-muted-foreground">
              Stripe has not confirmed payment for this session yet. Your course access will be available after confirmation.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-5 text-2xl font-bold">Payment status unavailable</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn’t verify a completed Stripe payment for this session. No enrollment was created from this page.
            </p>
          </>
        )}
        <div className="mt-7 grid gap-3">
          <Button asChild variant="gradient" className="w-full">
            <Link href="/dashboard"><GraduationCap className="mr-2 h-4 w-4" />Go to My Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={continueHref}>Continue Learning</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/courses"><ArrowLeft className="mr-2 h-4 w-4" />Back to Courses</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}