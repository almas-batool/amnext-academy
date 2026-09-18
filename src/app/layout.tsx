// ─────────────────────────────────────────────────────────────
//  src/app/layout.tsx
//  Root layout — wraps every page with providers and metadata.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/providers/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "AMNext Academy – Certify. Code. Grow.",
    template: "%s | AMNext Academy",
  },
  description:
    "A modern AI-powered certification platform. Learn through interactive notes, coding practice, and earn industry-recognised certificates.",
  keywords: ["certification", "coding", "AI tutor", "e-learning", "programming"],
  authors: [{ name: "AMNext Academy" }],
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    "AMNext Academy",
    title:       "AMNext Academy – Certify. Code. Grow.",
    description: "AI-powered certification & coding platform.",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AMNext Academy",
    description: "Certify. Code. Grow.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

