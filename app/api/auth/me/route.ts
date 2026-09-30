import { NextResponse } from "next/server";
import { verifyAccess } from "@/lib/auth";
import { readStore } from "@/lib/serverStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const payload = verifyAccess(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { store } = await readStore();
  const user = store.users.find(u => u.id === payload.sub);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { password, ...safe } = user as any;
  return NextResponse.json({ ok: true, user: safe });
}