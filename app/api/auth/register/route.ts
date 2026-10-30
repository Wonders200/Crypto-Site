import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { hashPassword, signAccess, signRefresh } from "@/lib/auth";
import { sendEmail, Templates } from "@/lib/email";
import { uid } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory rate limiter: 3 signups per IP per hour
const signupAttempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60 * 1000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Top disposable email domains to block
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
  const ip = getClientIp(req);
  const now = Date.now();
  
  // 1. Rate Limiting Check
  const entry = signupAttempts.get(ip);
  if (entry && entry.count >= MAX_ATTEMPTS && now < entry.until) {
    const secs = Math.ceil((entry.until - now) / 1000);
    return NextResponse.json({ error: `Too many signups. Try again in ${secs}s.` }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, email, password, turnstileToken } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lowerEmail = email.trim().toLowerCase();
    const domain = lowerEmail.split("@")[1];

    // 2. Disposable Email Check
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: "Disposable email addresses are not allowed. Please use a permanent email." }, { status: 400 });
    }

    // 3. Cloudflare Turnstile Verification
    const secretKey = process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAAAFtFYafE6MMITfe1HMhuJ3tRUB8";
    if (!turnstileToken) {
      return NextResponse.json({ error: "Please complete the security check." }, { status: 400 });
    }

    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: turnstileToken,
        remoteip: ip,
      }),
    });

    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }

    // 4. Process Signup
    const { store } = await readStore();
    const existingUser = store.users.find((u: any) => u.email.toLowerCase() === lowerEmail);

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const userId = uid("u");
    const passwordHash = await hashPassword(password);
    
    const newUser = {
      id: userId,
      name: name.trim(),
      email: lowerEmail,
      tier: "Standard",
      status: "active",
      kycVerified: false,
      kycStatus: "unverified",
      createdAt: now,
      passwordHash,
    };

    const nextStore = sanitizeStore({
      ...store,
      users: [newUser, ...(store.users || [])],
      balances: [{ userId, usd: 0, locked: 0, updatedAt: now }, ...(store.balances || [])]
    });

    await writeStore(nextStore);
    
    // Update rate limiter
    const cur = signupAttempts.get(ip) ?? { count: 0, until: 0 };
    cur.count += 1;
    cur.until = now + LOCKOUT_MS;
    signupAttempts.set(ip, cur);

    // Generate Tokens
    const payload = { sub: userId, email: lowerEmail, role: "customer" };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    // Send Welcome Email
    const template = Templates.welcome(name.trim());
    sendEmail({ to: lowerEmail, subject: template.subject, html: template.html }).catch(() => {});

    return NextResponse.json({
      ok: true,
      accessToken,
      refreshToken,
      user: { id: userId, name: newUser.name, email: newUser.email, tier: newUser.tier }
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}