import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readStore } from "@/lib/serverStore";
import {
  signAdminSession, verifyPassword, buildAdminVersion,
  SESSION_COOKIE, SESSION_MAX_AGE,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory rate limiter (resets on redeploy). 5 attempts / 15 min per IP.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.count >= MAX_ATTEMPTS && now < entry.until) {
    const secs = Math.ceil((entry.until - now) / 1000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${secs}s.` }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const { store } = await readStore();
  const creds: any = (store as any).credentials || {};
  const storedEmail = String(creds.email ?? "").toLowerCase();
  const storedHash = String(creds.passwordHash ?? "");
  const storedPlain = String(creds.password ?? "");

  const emailOk = email === storedEmail;

  // Prefer hash. Fall back to plaintext during the transition, then upgrade on success.
  let passOk = false;
  let upgradedHash: string | null = null;
  if (storedHash) {
    passOk = await verifyPassword(password, storedHash);
  } else if (storedPlain) {
    passOk = password === storedPlain;
    if (passOk) {
      // Auto-upgrade plaintext -> hash on first successful login
      const bcrypt = await import("bcryptjs");
      upgradedHash = await bcrypt.hash(password, 10);
    }
  }

  if (!emailOk || !passOk) {
    const cur = attempts.get(ip) ?? { count: 0, until: 0 };
    cur.count += 1;
    cur.until = now + LOCKOUT_MS;
    attempts.set(ip, cur);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Optionally persist the auto-upgraded hash
  if (upgradedHash) {
    try {
      const { writeStore } = await import("@/lib/serverStore");
      const { sanitizeStore } = await import("@/lib/sanitizeStore");
      const next = sanitizeStore({ ...store, credentials: { email: storedEmail, passwordHash: upgradedHash } } as any);
      await writeStore(next);
    } catch {}
  }

  attempts.delete(ip);

  const effectiveHash = upgradedHash ?? storedHash;
  const version = buildAdminVersion(effectiveHash || storedEmail);
  const token = await signAdminSession({ email: storedEmail, version });

  const res = NextResponse.json({ ok: true, email: storedEmail });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}