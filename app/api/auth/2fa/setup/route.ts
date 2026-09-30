import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { readStore, writeStore } from "@/lib/serverStore";
import { verifyAccess, generate2FASecret, build2FAURI, verify2FAToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST  generate a new 2FA secret + QR. Body: { token?: string, action: "start" | "confirm" } */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyAccess(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action ?? "start";
  const { store } = await readStore();
  const user = store.users.find(u => u.id === payload.sub);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = (user as any).twoFA as { enabled?: boolean; secret?: string } | undefined;

  if (action === "start") {
    const secret = generate2FASecret();
    const uri = build2FAURI(user.email, secret);
    const qr = await QRCode.toDataURL(uri);
    await writeStore({
      ...store,
      users: store.users.map(u => u.id === user.id ? { ...u, twoFA: { enabled: false, secret } } as any : u),
    });
    return NextResponse.json({ ok: true, secret, qr });
  }

  if (action === "confirm") {
    const totp = String(body?.token ?? "");
    if (!existing?.secret) return NextResponse.json({ error: "No setup in progress" }, { status: 400 });
    if (!verify2FAToken(totp, existing.secret)) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    await writeStore({
      ...store,
      users: store.users.map(u => u.id === user.id ? { ...u, twoFA: { enabled: true, secret: existing.secret } } as any : u),
    });
    return NextResponse.json({ ok: true, enabled: true });
  }

  if (action === "disable") {
    await writeStore({
      ...store,
      users: store.users.map(u => u.id === user.id ? { ...u, twoFA: { enabled: false } } as any : u),
    });
    return NextResponse.json({ ok: true, enabled: false });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}