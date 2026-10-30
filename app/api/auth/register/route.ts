import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { hashPassword, signAccess, signRefresh } from "@/lib/auth";
import { RegisterSchema, parseBody } from "@/lib/validate";
import { sendEmail, Templates, hasEmail } from "@/lib/email";
import { uid, AdminUser, AdminBalance } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1. Rate Limiting (3 signups per IP per hour)
const signupAttempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60 * 1000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// 2. Disposable Email Blocker
const DISPOSABLE_DOMAINS = [
  "mail.tm", "tempmail.com", "guerrillamail.com", "10minutemail.com", "yopmail.com",
  "throwawaymail.com", "sharklasers.com", "getnada.com", "dispostable.com", "mailinator.com",
  "temp-mail.org", "fakeinbox.com", "trashmail.com", "maildrop.cc", "mintemail.com",
  "mytrashmail.com", "spamgourmet.com", "mailnesia.com", "tempinbox.com", "burnermail.io",
  "throwaway.email", "generator.email", "mailsac.com", "inboxkitten.com", "tempr.email",
  "emailondeck.com", "burnermail.io", "mohmal.com", "harakirimail.com", "mailcatch.com",
  "tempmailaddress.com", "tempail.com", "email-temp.com", "mytemp.email", "moakt.com"
];

export async function POST(req: Request) {
  // READ-ONLY DEMO CHECK
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.CRYPTO_DATA_DIR === "data-demo") {
    return NextResponse.json({ error: "Signups disabled in demo. Use the demo account to log in." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const now = Date.now();
  
  // RATE LIMIT CHECK
  const entry = signupAttempts.get(ip);
  if (entry && entry.count >= MAX_ATTEMPTS && now < entry.until) {
    const secs = Math.ceil((entry.until - now) / 1000);
    return NextResponse.json({ error: `Too many signups. Try again in ${secs}s.` }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // CLOUDFLARE TURNSTILE CHECK
    const turnstileToken = body?.turnstileToken;
    const secretKey = process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAAAFtFYafE6MMITfe1HMhuJ3tRUB8";
    if (!turnstileToken) {
      return NextResponse.json({ error: "Please complete the security check." }, { status: 400 });
    }
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: turnstileToken, remoteip: ip }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }

    // ZOD VALIDATION (Your original logic)
    const parsed = parseBody(RegisterSchema, body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, email, password } = parsed.data;
    const referralCode = (body as any)?.referralCode || "";

    // DISPOSABLE EMAIL CHECK
    const domain = email.toLowerCase().split("@")[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: "Disposable email addresses are not allowed. Please use a permanent email." }, { status: 400 });
    }

    // EXISTING USER CHECK
    const { store } = await readStore();
    const exists = store.users.find(u => u.email.toLowerCase() === email);
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const userId = uid("u");
    const pwHash = await hashPassword(password);

    // REFERRAL LOGIC (Your original logic)
    const { makeReferralCode, findByReferralCode } = require("@/lib/referrals");
    const referrer = referralCode ? findByReferralCode(store, referralCode) : null;
    
    const user: AdminUser = {
      id: userId,
      name,
      email,
      tier: "Standard",
      status: "active",
      kycVerified: false,
      kycStatus: "unverified",
      createdAt: now,
      referralCode: makeReferralCode(name),
      referredBy: referrer?.id ?? undefined,
      referralBonusUsd: 0,
      password: pwHash,
    };

    const balance: AdminBalance = { userId, usd: 0, locked: 0, updatedAt: now };

    const next = {
      ...store,
      users: [user, ...store.users],
      balances: [balance, ...store.balances],
    };
    await writeStore(next);

    // UPDATE RATE LIMITER
    const cur = signupAttempts.get(ip) ?? { count: 0, until: 0 };
    cur.count += 1;
    cur.until = now + LOCKOUT_MS;
    signupAttempts.set(ip, cur);

    const payload = { sub: userId, email, role: "customer" as const };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    if (hasEmail()) {
      const t = Templates.welcome(name);
      sendEmail({ to: email, subject: t.subject, html: t.html }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      user: { id: userId, name, email, tier: "Standard" },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}