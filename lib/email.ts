interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "ApexVault <noreply@apexvault.example>";

export function hasEmail(): boolean {
  return Boolean(RESEND_KEY);
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  if (!RESEND_KEY) {
    console.log("[email stub] " + subject + "  " + to);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    return res.ok;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

export const Templates = {
  welcome: (name: string) => ({
    subject: "Welcome to ApexVault",
    html: `<h1>Hi ${name},</h1><p>Your account is ready. Sign in to start trading.</p>`,
  }),
  depositSubmitted: (ref: string, amount: string) => ({
    subject: `Deposit received  ${ref}`,
    html: `<p>We received your deposit of ${amount}.</p><p>Reference: ${ref}</p><p>Funds will appear in your balance once confirmed.</p>`,
  }),
  depositApproved: (ref: string, amount: string) => ({
    subject: `Deposit confirmed  ${ref}`,
    html: `<p>Your deposit of ${amount} has been confirmed and credited to your balance.</p>`,
  }),
  withdrawalSubmitted: (ref: string, amount: string) => ({
    subject: `Withdrawal request received  ${ref}`,
    html: `<p>Your withdrawal of ${amount} is being processed.</p><p>Reference: ${ref}</p>`,
  }),
  withdrawalApproved: (ref: string, amount: string) => ({
    subject: `Withdrawal complete  ${ref}`,
    html: `<p>Your withdrawal of ${amount} has been sent to the destination you specified.</p>`,
  }),
  kycApproved: (name: string) => ({
    subject: "Identity verified",
    html: `<p>Hi ${name},</p><p>Your identity has been verified. Full access to deposits, withdrawals, and trading is now enabled.</p>`,
  }),
  kycRejected: (name: string, reason: string) => ({
    subject: "Identity verification needs attention",
    html: `<p>Hi ${name},</p><p>We couldn't verify your documents.</p><p><strong>Reason:</strong> ${reason}</p><p>You can resubmit from your account.</p>`,
  }),
  twoFAEnabled: () => ({
    subject: "Two-factor authentication enabled",
    html: `<p>2FA is now enabled on your account. If this wasn't you, contact support immediately.</p>`,
  }),
};