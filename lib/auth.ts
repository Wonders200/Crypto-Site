import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-jwt-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-in-production";
const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export interface TokenPayload {
  sub: string;      // user id
  email: string;
  role: "customer" | "admin";
}

/* ---------- Password hashing ---------- */
export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean }> {
  // Legacy plaintext  accept once, then re-hash on next save
  if (!stored.startsWith("$2")) {
    return { ok: pw === stored, needsRehash: true };
  }
  const ok = await bcrypt.compare(pw, stored);
  return { ok, needsRehash: false };
}

/* ---------- JWT ---------- */
export function signAccess(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefresh(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token: string): TokenPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as TokenPayload; } catch { return null; }
}

export function verifyRefresh(token: string): TokenPayload | null {
  try { return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload; } catch { return null; }
}

/* ---------- 2FA (TOTP) ---------- */
export function generate2FASecret(): string {
  return authenticator.generateSecret();
}

export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function build2FAURI(email: string, secret: string, issuer = "CryptoSite"): string {
  return authenticator.keyuri(email, issuer, secret);
}