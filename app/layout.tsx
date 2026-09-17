import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AMNext Academy — Build Skills That Move Your Career Forward",
  description: "A modern learning platform for software, AI, cloud, data and cybersecurity.",
  metadataBase: new URL("https://amnext.academy"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={inter.className}>{children}</body></html>;
}