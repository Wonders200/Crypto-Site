import { NextResponse } from "next/server";
import { verifyRefresh, signAccess, signRefresh } from "@/lib/auth";
import { RefreshSchema, parseBody } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseBody(RefreshSchema, body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const payload = verifyRefresh(parsed.data.refreshToken);
    if (!payload) return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });

    return NextResponse.json({
      ok: true,
      accessToken: signAccess({ sub: payload.sub, email: payload.email, role: payload.role }),
      refreshToken: signRefresh({ sub: payload.sub, email: payload.email, role: payload.role }),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}