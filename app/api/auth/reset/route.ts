import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { hashPassword } from "@/lib/auth"; // Using the customer auth helper

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { store } = await readStore();
    const record = (store.resetTokens || []).find((t: any) => t.token === token);

    if (!record || record.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = store.users.find((u: any) => u.id === record.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Hash the new password using bcrypt (assuming your customer auth uses this)
    const hashed = await hashPassword(newPassword);
    
    // Update user and remove token
    const nextStore = sanitizeStore({
      ...store,
      users: store.users.map((u: any) => u.id === user.id ? { ...u, passwordHash: hashed } : u),
      resetTokens: (store.resetTokens || []).filter((t: any) => t.token !== token)
    });

    await writeStore(nextStore);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}