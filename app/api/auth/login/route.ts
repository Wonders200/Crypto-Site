import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { verifyPassword, hashPassword, signAccess, signRefresh, verify2FAToken } from "@/lib/auth";
import { LoginSchema, parseBody } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseBody(LoginSchema, body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { email, password, totp } = parsed.data;

    const { store } = await readStore();
    // DEMO MODE: port-based detection (works even if env vars not loaded)
    const host = req.headers.get("host") || "";
    const isDemoRequest = host.includes(":3002");
    if (isDemoRequest) {
      const lowerEmail = email.toLowerCase();
      const DEMO_CUSTOMER = { email: "demo@apexvault.io", password: "DemoCustomer2026!", name: "Alexa S Adamz", tier: "Pro" };
      if (lowerEmail === DEMO_CUSTOMER.email && password === DEMO_CUSTOMER.password) {
        const demoUser = store.users.find(u => u.email.toLowerCase() === lowerEmail)
          || { id: "demo-u1", name: DEMO_CUSTOMER.name, email: DEMO_CUSTOMER.email, tier: DEMO_CUSTOMER.tier };
        const payload = { sub: demoUser.id, email: demoUser.email, role: "customer" as const };
        return NextResponse.json({
          ok: true,
          user: { id: demoUser.id, name: demoUser.name, email: demoUser.email, tier: demoUser.tier },
          accessToken: signAccess(payload),
          refreshToken: signRefresh(payload),
        });
      }
    }

    const user = store.users.find(u => u.email.toLowerCase() === email);
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (!user.password) {
      // Legacy user with no password  set it now
      const pwHash = await hashPassword(password);
      await writeStore({
        ...store,
        users: store.users.map(u => u.id === user.id ? { ...u, password: pwHash } : u),
      });
    } else {
      const { ok, needsRehash } = await verifyPassword(password, user.password);
      if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      if (needsRehash) {
        const pwHash = await hashPassword(password);
        await writeStore({
          ...store,
          users: store.users.map(u => u.id === user.id ? { ...u, password: pwHash } : u),
        });
      }
    }

    // 2FA
    const twoFA = (user as any).twoFA as { enabled?: boolean; secret?: string } | undefined;
    if (twoFA?.enabled) {
      if (!totp) return NextResponse.json({ error: "2FA token required", needs2FA: true }, { status: 401 });
      if (!verify2FAToken(totp, twoFA.secret ?? "")) {
        return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
      }
    }

    const payload = { sub: user.id, email: user.email, role: "customer" as const };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, tier: user.tier },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}