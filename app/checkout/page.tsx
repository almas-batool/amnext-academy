"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Lock, ShieldCheck } from "lucide-react";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams(window.location.search);
      const courseId = params.get("course") || "1";

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ courseId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <main
      className="container"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center"
      }}
    >
      <div
        className="card"
        style={{
          width: "min(620px, 100%)",
          padding: 35
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="pill">
            <Lock size={13} /> SECURE CHECKOUT
          </div>

          <h1 style={{ fontSize: 38, marginBottom: 8 }}>
            Complete your enrollment
          </h1>

          <p className="muted">
            Secure payment powered by Stripe.
          </p>
        </div>

        <div
          className="glass"
          style={{
            padding: 22,
            margin: "28px 0",
            borderRadius: 14
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div className="muted" style={{ fontSize: 11 }}>
                COURSE
              </div>

              <h3 style={{ margin: "6px 0" }}>
                Full-Stack Web Development
              </h3>

              <div className="muted" style={{ fontSize: 12 }}>
                Lifetime access - Certificate included
              </div>
            </div>

            <div style={{ fontSize: 28, fontWeight: 900 }}>
              $49
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 22
          }}
        >
          <div className="glass" style={{ padding: 14, borderRadius: 10 }}>
            <CreditCard size={17} />
            <div style={{ fontSize: 12, marginTop: 7 }}>
              Secure card payment
            </div>
          </div>

          <div className="glass" style={{ padding: 14, borderRadius: 10 }}>
            <ShieldCheck size={17} />
            <div style={{ fontSize: 12, marginTop: 7 }}>
              Stripe protected
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 13,
              borderRadius: 10,
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.25)",
              color: "#fca5a5",
              fontSize: 13,
              marginBottom: 15
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "Opening Stripe..." : "Pay $49 and Start Learning"}
          {!loading && <ArrowRight size={17} />}
        </button>

        <p
          className="muted"
          style={{
            textAlign: "center",
            fontSize: 11,
            marginTop: 15
          }}
        >
          Stripe Test Mode - No real charge
        </p>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/courses" className="muted" style={{ fontSize: 12 }}>
            Back to courses
          </Link>
        </div>
      </div>
    </main>
  );
}
