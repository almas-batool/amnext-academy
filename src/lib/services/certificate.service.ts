// ─────────────────────────────────────────────────────────────
//  src/lib/services/certificate.service.ts
//  Generates SVG certificates and persists them to R2.
// ─────────────────────────────────────────────────────────────

import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/services/storage.service";
import { sendCertificateEmail } from "@/lib/services/email.service";
import { awardXP } from "@/lib/services/gamification.service";

// ── Main entry ─────────────────────────────────────────────────

export async function issueCertificate(
  userId:  string,
  certId:  string,
  score?:  number
): Promise<{ certificateId: string; pdfUrl: string }> {
  // Idempotent: return existing certificate if already issued
  const existing = await prisma.certificate.findFirst({
    where: { userId, certId },
  });
  if (existing) {
    return { certificateId: existing.certificateId, pdfUrl: existing.pdfUrl };
  }

  const [user, cert] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.certification.findUnique({ where: { id: certId } }),
  ]);
  if (!user || !cert) throw new Error("User or certification not found");

  const certUniqueId = `LF-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  const verifyUrl    = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certUniqueId}`;
  const issuedDate   = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const svg    = buildCertificateSVG({ name: user.name ?? user.email, certTitle: cert.title, certId: certUniqueId, date: issuedDate, score, verifyUrl });
  const buffer = Buffer.from(svg, "utf-8");
  const key    = `certificates/${certUniqueId}.svg`;
  const url    = await uploadToR2(key, buffer, "image/svg+xml");

  await prisma.certificate.create({
    data: { userId, certId, certificateId: certUniqueId, pdfUrl: url, score },
  });

  // Complete enrollment
  await prisma.enrollment.updateMany({
    where: { userId, certId },
    data:  { completedAt: new Date(), progress: 1.0 },
  });

  // Award XP (non-blocking)
  awardXP(userId, "certification_earned", { certId }).catch(console.error);

  // Send email (non-blocking)
  sendCertificateEmail(user.email, user.name ?? "Learner", cert.title, url, certUniqueId).catch(console.error);

  return { certificateId: certUniqueId, pdfUrl: url };
}

// ── SVG builder ────────────────────────────────────────────────

function buildCertificateSVG(d: {
  name:      string;
  certTitle: string;
  certId:    string;
  date:      string;
  score?:    number;
  verifyUrl: string;
}): string {
  const safe = (s: string) =>
    s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 636" width="900" height="636">
  <defs>
    <linearGradient id="bg"     x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#0a0a1a"/>
      <stop offset="100%" style="stop-color:#1a0a2e"/>
    </linearGradient>
    <linearGradient id="gold"   x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   style="stop-color:#f59e0b"/>
      <stop offset="50%"  style="stop-color:#fcd34d"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
    <linearGradient id="purple" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="900" height="636" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="50"  cy="50"  r="120" fill="none" stroke="#6366f1" stroke-width="0.5" opacity="0.15"/>
  <circle cx="850" cy="586" r="120" fill="none" stroke="#8b5cf6" stroke-width="0.5" opacity="0.15"/>
  <circle cx="450" cy="318" r="280" fill="none" stroke="#4f46e5" stroke-width="0.5" opacity="0.08"/>

  <!-- Outer border -->
  <rect x="20" y="20" width="860" height="596" fill="none" stroke="url(#gold)"   stroke-width="1.5" rx="4" opacity="0.7"/>
  <rect x="28" y="28" width="844" height="580" fill="none" stroke="#6366f1"       stroke-width="0.5" rx="2" opacity="0.4"/>

  <!-- Corner ornaments -->
  <polygon points="20,20 56,20 20,56"   fill="#f59e0b" opacity="0.4"/>
  <polygon points="880,20 844,20 880,56" fill="#f59e0b" opacity="0.4"/>
  <polygon points="20,616 56,616 20,580" fill="#f59e0b" opacity="0.4"/>
  <polygon points="880,616 844,616 880,580" fill="#f59e0b" opacity="0.4"/>

  <!-- Brand -->
  <text x="450" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#6366f1" letter-spacing="8">AMNext Academy</text>

  <!-- Title -->
  <text x="450" y="148" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="url(#gold)" font-weight="bold">Certificate of Completion</text>
  <line x1="180" y1="165" x2="720" y2="165" stroke="url(#gold)" stroke-width="1" opacity="0.5"/>

  <!-- Subtitle -->
  <text x="450" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#a5b4fc" letter-spacing="3">THIS IS TO CERTIFY THAT</text>

  <!-- Recipient name -->
  <text x="450" y="288" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#ffffff" font-weight="bold">${safe(d.name)}</text>
  <line x1="120" y1="305" x2="780" y2="305" stroke="url(#purple)" stroke-width="2"/>

  <!-- Achievement -->
  <text x="450" y="348" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#94a3b8">has successfully completed</text>
  <text x="450" y="398" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="url(#gold)" font-weight="bold">${safe(d.certTitle)}</text>

  ${d.score !== undefined ? `<text x="450" y="435" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#6ee7b7">Final Score: ${d.score.toFixed(1)}%</text>` : ""}

  <!-- Seal -->
  <circle cx="450" cy="482" r="28" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.6"/>
  <text x="450" y="490" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="url(#gold)">✓</text>

  <!-- Meta row -->
  <text x="170" y="534" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#6b7280">ISSUED ON</text>
  <text x="170" y="552" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#e2e8f0">${d.date}</text>

  <text x="450" y="534" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#6b7280">CERTIFICATE ID</text>
  <text x="450" y="552" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#a5b4fc" font-weight="bold">${d.certId}</text>

  <text x="730" y="534" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#6b7280">VERIFY AT</text>
  <text x="730" y="552" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#6366f1">${safe(d.verifyUrl)}</text>
</svg>`;
}

