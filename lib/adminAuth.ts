import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-only-admin-secret-change-me"
);
const SESSION_COOKIE = "apexvault_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export { SESSION_COOKIE, SESSION_MAX_AGE };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash || !hash.startsWith("$2")) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function signAdminSession(payload: { email: string; version: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminSession(token: string): Promise<{ email: string; version: string } | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    if (typeof payload.email !== "string" || typeof payload.version !== "string") return null;
    return { email: payload.email, version: payload.version };
  } catch {
    return null;
  }
}

export function buildAdminVersion(passwordHash: string): string {
  const salt = process.env.SESSION_VERSION_SALT || "dev-salt";
  return Buffer.from(`${salt}:${passwordHash}`).toString("base64").slice(0, 32);
}