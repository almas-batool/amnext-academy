// ─────────────────────────────────────────────────────────────
//  src/lib/services/email.service.ts
//  Transactional emails via Resend.
// ─────────────────────────────────────────────────────────────

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM    = process.env.EMAIL_FROM    ?? "noreply@AMNext Academy.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP     = "AMNext Academy";

// ── Shared layout wrapper ──────────────────────────────────────
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px">${APP}</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:14px">Your AI-powered learning platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a4a">
              <p style="margin:0;color:#555;font-size:12px;text-align:center">
                © ${new Date().getFullYear()} ${APP}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:20px 0">${label}</a>`;

// ── Emails ─────────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  return resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Verify your ${APP} account`,
    html:    emailLayout(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px">Verify your email</h2>
      <p style="color:#a0aec0;font-size:15px;line-height:1.6">Hi ${name || "there"},<br/><br/>
      Click below to verify your email and start learning.</p>
      ${btn(url, "Verify Email")}
      <p style="color:#555;font-size:13px;margin-top:24px">Link expires in 24 hours.</p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Reset your ${APP} password`,
    html:    emailLayout(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px">Reset your password</h2>
      <p style="color:#a0aec0;font-size:15px;line-height:1.6">Hi ${name || "there"},<br/><br/>
      Click below to set a new password for your account.</p>
      ${btn(url, "Reset Password")}
      <p style="color:#555;font-size:13px;margin-top:24px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  });
}

export async function sendCertificateEmail(
  email: string,
  name: string,
  certTitle: string,
  certUrl: string,
  certId: string
) {
  const verifyUrl = `${APP_URL}/verify/${certId}`;
  return resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `🎓 Your ${certTitle} Certificate is Ready!`,
    html:    emailLayout(`
      <h2 style="color:#fbbf24;font-size:26px;margin:0 0 8px">Congratulations! 🎉</h2>
      <p style="color:#a0aec0;font-size:15px;line-height:1.6">
        Hi ${name || "there"},<br/><br/>
        You have successfully completed <strong style="color:#fff">${certTitle}</strong> and earned your certificate!
      </p>
      <div style="background:#0f0f1a;border-radius:12px;padding:20px;margin:20px 0">
        <p style="color:#6366f1;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">Certificate ID</p>
        <code style="color:#fff;font-size:18px;font-weight:700">${certId}</code>
      </div>
      ${btn(certUrl, "Download Certificate")}
      <p style="color:#555;font-size:13px;margin-top:16px">
        Verify at: <a href="${verifyUrl}" style="color:#6366f1">${verifyUrl}</a>
      </p>
    `),
  });
}

