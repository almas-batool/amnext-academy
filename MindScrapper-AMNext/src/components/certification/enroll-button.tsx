// ─────────────────────────────────────────────────────────────
// src/components/certification/enroll-button.tsx
// Handles free enrollment, Razorpay (INR) and Stripe (USD).
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface EnrollButtonProps {
  certId: string;
  price: number;
  currency: string;
  certTitle: string;
  isLoggedIn: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function EnrollButton({
  certId,
  price,
  currency,
  certTitle,
  isLoggedIn,
}: EnrollButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/certifications/${certId}`);
      return;
    }

    setLoading(true);

    try {
      // Check if course is free
      const enrollRes = await fetch(`/api/certifications/${certId}/enroll`, {
        method: "POST",
      });

      const enrollJson = await enrollRes.json();

      if (!enrollRes.ok) {
        toast({
          title: "Error",
          description: enrollJson.error,
          variant: "destructive",
        });
        return;
      }

      // Free course
      if (!enrollJson.requiresPayment) {
        toast({
          title: "Enrolled Successfully",
          description: "You can now start learning.",
        });

        router.push(`/certifications/${certId}/learn`);
        router.refresh();
        return;
      }

      // ==========================
      // Razorpay (INR)
      // ==========================
      if (currency === "INR") {
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            certId,
            gateway: "RAZORPAY",
          }),
        });

        const orderJson = await orderRes.json();

        if (!orderRes.ok) {
          toast({
            title: "Payment Error",
            description: orderJson.error,
            variant: "destructive",
          });
          return;
        }

        const { orderId, amount, keyId, userName, userEmail } = orderJson.data;

        const razorpay = new window.Razorpay({
          key: keyId,
          amount,
          currency: "INR",
          name: "MindScrapper",
          description: certTitle,
          order_id: orderId,

          prefill: {
            name: userName,
            email: userEmail,
          },

          theme: {
            color: "#6366f1",
          },

          handler: async (response: any) => {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                certId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();

            if (!verifyRes.ok) {
              toast({
                title: "Payment Verification Failed",
                description:
                  verifyJson.error ?? "Your payment could not be verified.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "Payment Successful 🎉",
              description: "You are now enrolled.",
            });

            router.push(`/certifications/${certId}/learn`);
            router.refresh();
          },

          modal: {
            ondismiss: () => {
              toast({
                title: "Payment Cancelled",
              });
            },
          },
        });

        razorpay.open();
      }

      // ==========================
      // Stripe (USD)
      // ==========================
      else {
        const paymentRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            certId,
            gateway: "STRIPE",
          }),
        });

        const paymentJson = await paymentRes.json();

        if (!paymentRes.ok) {
          toast({
            title: "Payment Error",
            description: paymentJson.error,
            variant: "destructive",
          });
          return;
        }

        window.location.href = paymentJson.data.checkoutUrl;
      }
    } catch (err) {
      console.error(err);

      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <Button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full"
        variant="gradient"
        size="lg"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4 mr-2" />
        )}

        {price === 0
          ? "Enroll for Free"
          : `Buy for ${formatCurrency(price, currency)}`}
      </Button>
    </>
  );
}
