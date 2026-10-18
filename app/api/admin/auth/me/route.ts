import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, SESSION_COOKIE } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });

  const session = await verifyAdminSession(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  return NextResponse.json({
    email: session.email,
    role: session.role || "support",
    permissions: session.permissions || [],
  });
}