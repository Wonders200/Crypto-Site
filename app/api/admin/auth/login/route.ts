import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import {
  signAdminSession, verifyPassword, buildAdminVersion,
  SESSION_COOKIE, SESSION_MAX_AGE,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  
  // Check the new multi-admin array first
  const admins = store.admins || [];
  const adminAccount = admins.find((a: any) => a.email === email);
  
  // Fallback to legacy single credential setup just in case
  const legacyCreds: any = store.credentials || {};
  const isLegacy = !adminAccount && email === legacyCreds.email;
  
  let passOk = false;
  let role: "superadmin" | "support" = "superadmin"; // Default legacy to superadmin
  let upgradedHash: string | null = null;

  if (adminAccount) {
    passOk = await verifyPassword(password, adminAccount.passwordHash);
    role = adminAccount.role;
  } else if (isLegacy && legacyCreds.passwordHash) {
    passOk = await verifyPassword(password, legacyCreds.passwordHash);
  } else if (isLegacy && legacyCreds.password) {
    passOk = password === legacyCreds.password;
    if (passOk) {
      const bcrypt = await import("bcryptjs");
      upgradedHash = await bcrypt.hash(password, 10);
    }
  }

  if (!passOk) {
    const cur = attempts.get(ip) ?? { count: 0, until: 0 };
    cur.count += 1;
    cur.until = now + LOCKOUT_MS;
    attempts.set(ip, cur);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);

  const effectiveHash = adminAccount?.passwordHash || upgradedHash || legacyCreds.passwordHash || "v1";
  const version = buildAdminVersion(effectiveHash);
  
  // THIS is the crucial part that was missing: we pass the role into the JWT
  const token = await signAdminSession({ email, version, role });

  const res = NextResponse.json({ ok: true, email, role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}