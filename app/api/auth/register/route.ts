import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { hashPassword, signAccess, signRefresh } from "@/lib/auth";
import { RegisterSchema, parseBody } from "@/lib/validate";
import { sendEmail, Templates, hasEmail } from "@/lib/email";
import { uid, AdminUser, AdminBalance } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseBody(RegisterSchema, body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, email, password } = parsed.data;

    const { store } = await readStore();
    const exists = store.users.find(u => u.email.toLowerCase() === email);
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const userId = uid("u");
    const pwHash = await hashPassword(password);

    const user: AdminUser = {
      id: userId,
      name,
      email,
      tier: "Standard",
      status: "active",
      kycVerified: false,
      kycStatus: "unverified",
      createdAt: Date.now(),
      password: pwHash,
    };

    const balance: AdminBalance = { userId, usd: 0, locked: 0, updatedAt: Date.now() };

    const next = {
      ...store,
      users: [user, ...store.users],
      balances: [balance, ...store.balances],
    };
    await writeStore(next);

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