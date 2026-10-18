import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import {
  hashPassword, verifyPassword, signAdminSession, buildAdminVersion,
  verifyAdminSession, SESSION_COOKIE, SESSION_MAX_AGE,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const session = await verifyAdminSession(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const currentPassword = String(body?.currentPassword ?? "");
  const newEmail = String(body?.newEmail ?? "").trim().toLowerCase();
  const newPassword = String(body?.newPassword ?? "");

  if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
  if (!newEmail.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (newPassword.length < 12) return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });

  const { store } = await readStore();
  const creds: any = (store as any).credentials || {};
  const storedHash = String(creds.passwordHash ?? "");
  const storedPlain = String(creds.password ?? "");

  let ok = false;
  if (storedHash) ok = await verifyPassword(currentPassword, storedHash);
  else if (storedPlain) ok = currentPassword === storedPlain;

  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  const newHash = await hashPassword(newPassword);
  const next = sanitizeStore({
    ...store,
    credentials: { email: newEmail, passwordHash: newHash },
  } as any);
  await writeStore(next);

  const version = buildAdminVersion(newHash);
  const fresh = await signAdminSession({ email: newEmail, version });

  const res = NextResponse.json({ ok: true, email: newEmail });
  (await cookies()).set(SESSION_COOKIE, fresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}