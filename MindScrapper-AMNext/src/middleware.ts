// ─────────────────────────────────────────────────────────────
//  src/middleware.ts
//  Global middleware — RBAC guards + security headers.
//  Runs on every matched request at the Edge.
// ─────────────────────────────────────────────────────────────
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token }   = req.nextauth;
    const { pathname } = req.nextUrl;

    // ── RBAC ──────────────────────────────────────────────────
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      pathname.startsWith("/instructor") &&
      token?.role !== "ADMIN" &&
      token?.role !== "INSTRUCTOR"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ── Security headers ──────────────────────────────────────
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options",           "DENY");
    res.headers.set("X-Content-Type-Options",    "nosniff");
    res.headers.set("Referrer-Policy",           "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy",        "camera=(), microphone=(), geolocation=()");
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    return res;
  },
  {
    callbacks: {
      // Allow unauthenticated access to public routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const publicPaths  = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/verify",
        ];
        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith(p + "/")
        );
        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static / _next/image (Next.js assets)
     * - favicon.ico
     * - API routes under /api/auth (NextAuth internals)
     * - /api/certificates/:certId (public verification)
     * - /api/payments/webhook/* (Razorpay/Stripe webhooks — no session)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/certificates|api/payments/webhook).*)",
  ],
};
