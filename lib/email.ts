interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "ApexVault <noreply@apexvault.icu>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "support@apexvault.icu";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apexvault.icu";

export function hasEmail(): boolean {
  return Boolean(RESEND_KEY);
}

interface LayoutOpts {
  preheader?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

function layout({ preheader, heading, body, ctaLabel, ctaHref, tone = "default" }: LayoutOpts): string {
  const accent =
    tone === "success" ? "#22c55e" :
    tone === "warning" ? "#e3b341" :
    tone === "danger"  ? "#f85149" :
    "#6366f1";

  const cta = ctaLabel && ctaHref ? `
    <tr><td align="center" style="padding:28px 32px 8px 32px;">
      <a href="${ctaHref}" style="display:inline-block;background:${accent};color:#0a0b0f;font-weight:700;font-size:15px;line-height:1;padding:14px 28px;border-radius:8px;text-decoration:none;">${ctaLabel}</a>
    </td></tr>` : "";

  const pre = preheader
    ? `<div style="display:none;font-size:1px;color:#0a0b0f;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;">
${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0b0f;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#12141c;border:1px solid #2a2e3b;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:28px 32px;border-bottom:1px solid #2a2e3b;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle;">
            <div style="display:inline-block;width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#22c55e,#6366f1);text-align:center;line-height:36px;color:#0a0b0f;font-weight:800;font-size:18px;">A</div>
          </td>
          <td style="vertical-align:middle;padding-left:12px;">
            <div style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.2px;">ApexVault</div>
          </td>
        </tr></table>
      </td></tr>

      <tr><td style="padding:32px 32px 8px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">${heading}</h1>
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;color:#c9cdd4;font-size:15px;line-height:1.6;">
        ${body}
      </td></tr>

      ${cta}

      <tr><td style="padding:32px;border-top:1px solid #2a2e3b;color:#8b92a5;font-size:12px;line-height:1.6;">
        <p style="margin:0 0 8px 0;">Need help? Reply to this email or contact <a href="mailto:support@apexvault.icu" style="color:#22c55e;text-decoration:none;">support@apexvault.icu</a>.</p>
        <p style="margin:0 0 8px 0;">ApexVault &middot; <a href="${SITE_URL}" style="color:#8b92a5;text-decoration:none;">apexvault.icu</a></p>
        <p style="margin:0;color:#5a6070;">This is a transactional email. Cryptocurrency investments carry risk of loss.</p>
      </td></tr>
    </table>
    <div style="height:24px;"></div>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<boolean> {
  if (!RESEND_KEY) {
    console.log("[email stub] " + subject + " -> " + to);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        text: text ?? html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[email] send failed", res.status, err.slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send error", e);
    return false;
  }
}

export const Templates = {
  welcome: (name: string) => ({
    subject: "Welcome to ApexVault",
    html: layout({
      preheader: "Your account is ready. Sign in to get started.",
      heading: "Welcome, " + name,
      body: `<p style="margin:0 0 14px 0;">Your ApexVault account is ready. You can now deposit funds, trade 200+ digital assets, and earn yield.</p>
             <p style="margin:0;">To unlock withdrawals and higher limits, complete identity verification from your dashboard.</p>`,
      ctaLabel: "Go to dashboard",
      ctaHref: SITE_URL + "/dashboard",
      tone: "success",
    }),
  }),

  depositSubmitted: (ref: string, amount: string) => ({
    subject: `Deposit received \u2014 ${ref}`,
    html: layout({
      preheader: "We received your deposit and it is being reviewed.",
      heading: "Deposit received",
      body: `<p style="margin:0 0 14px 0;">Thanks. We received your deposit of <strong style="color:#ffffff;">${amount}</strong>.</p>
             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:14px 0;background:#0a0b0f;border:1px solid #2a2e3b;border-radius:8px;">
               <tr><td style="padding:12px 14px;color:#8b92a5;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Reference</td>
                   <td style="padding:12px 14px;color:#ffffff;font-size:13px;text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${ref}</td></tr>
             </table>
             <p style="margin:0;">Funds will appear in your balance once our team confirms the transaction. This usually takes under 1 business hour.</p>`,
      ctaLabel: "View balance",
      ctaHref: SITE_URL + "/balance",
      tone: "default",
    }),
  }),

  depositApproved: (ref: string, amount: string) => ({
    subject: `Deposit confirmed \u2014 ${ref}`,
    html: layout({
      preheader: "Your deposit has been confirmed and credited.",
      heading: "Deposit confirmed",
      body: `<p style="margin:0 0 14px 0;">Your deposit of <strong style="color:#ffffff;">${amount}</strong> has been confirmed and credited to your balance.</p>
             <p style="margin:0;color:#8b92a5;font-size:13px;">Reference: <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9cdd4;">${ref}</span></p>`,
      ctaLabel: "View balance",
      ctaHref: SITE_URL + "/balance",
      tone: "success",
    }),
  }),

  withdrawalSubmitted: (ref: string, amount: string) => ({
    subject: `Withdrawal request received \u2014 ${ref}`,
    html: layout({
      preheader: "Your withdrawal is being processed.",
      heading: "Withdrawal request received",
      body: `<p style="margin:0 0 14px 0;">We received your withdrawal request for <strong style="color:#ffffff;">${amount}</strong>. It is now being processed.</p>
             <p style="margin:0;color:#8b92a5;font-size:13px;">Reference: <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9cdd4;">${ref}</span></p>`,
      ctaLabel: "View transaction",
      ctaHref: SITE_URL + "/balance",
      tone: "default",
    }),
  }),

  withdrawalApproved: (ref: string, amount: string) => ({
    subject: `Withdrawal complete \u2014 ${ref}`,
    html: layout({
      preheader: "Your withdrawal has been sent.",
      heading: "Withdrawal complete",
      body: `<p style="margin:0 0 14px 0;">Your withdrawal of <strong style="color:#ffffff;">${amount}</strong> has been sent to the destination you specified.</p>
             <p style="margin:0;color:#8b92a5;font-size:13px;">Reference: <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9cdd4;">${ref}</span></p>`,
      ctaLabel: "View transaction",
      ctaHref: SITE_URL + "/balance",
      tone: "success",
    }),
  }),

  kycApproved: (name: string) => ({
    subject: "Your identity has been verified",
    html: layout({
      preheader: "Verification complete. Full account access unlocked.",
      heading: "You're verified, " + name,
      body: `<p style="margin:0 0 14px 0;">Your identity has been successfully verified. Your account now has full access:</p>
             <ul style="margin:0 0 14px 0;padding-left:20px;color:#c9cdd4;">
               <li style="margin:4px 0;">Deposits and withdrawals</li>
               <li style="margin:4px 0;">Trading all listed assets</li>
               <li style="margin:4px 0;">Earn products and staking</li>
             </ul>
             <p style="margin:0;">Nothing more to do \u2014 you're all set.</p>`,
      ctaLabel: "Open dashboard",
      ctaHref: SITE_URL + "/dashboard",
      tone: "success",
    }),
  }),

  kycRejected: (name: string, reason: string) => ({
    subject: "Action needed \u2014 identity verification",
    html: layout({
      preheader: "We need a bit more from you to verify your identity.",
      heading: "Verification needs attention",
      body: `<p style="margin:0 0 14px 0;">Hi ${name}, we couldn't verify your documents on this attempt.</p>
             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:14px 0;background:#1a0f10;border:1px solid #4a2226;border-radius:8px;">
               <tr><td style="padding:14px;">
                 <div style="color:#f85149;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:6px;">Reason</div>
                 <div style="color:#e5e7eb;font-size:14px;line-height:1.5;">${reason}</div>
               </td></tr>
             </table>
             <p style="margin:0;">You can resubmit from your account at any time. Most rejections are due to blurry photos, glare, or an expired document.</p>`,
      ctaLabel: "Resubmit documents",
      ctaHref: SITE_URL + "/kyc",
      tone: "danger",
    }),
  }),

  twoFAEnabled: () => ({
    subject: "Two-factor authentication enabled",
    html: layout({
      preheader: "2FA was just enabled on your account.",
      heading: "2FA is now active",
      body: `<p style="margin:0 0 14px 0;">Two-factor authentication has been enabled on your account. You will be asked for a 6-digit code each time you sign in.</p>
             <p style="margin:0;color:#e3b341;font-size:14px;"><strong>If this wasn't you,</strong> contact support immediately at <a href="mailto:support@apexvault.icu" style="color:#22c55e;text-decoration:none;">support@apexvault.icu</a>.</p>`,
      tone: "warning",
    }),
  }),
};