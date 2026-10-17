import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { sendEmail, Templates } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { store } = await readStore();
    const user = store.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    // SECURITY: Always return success even if user not found to prevent email enumeration
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Keep only the latest token for this user
    const cleanTokens = (store.resetTokens || []).filter((t: any) => t.userId !== user.id);
    const nextStore = sanitizeStore({
      ...store,
      resetTokens: [...cleanTokens, { userId: user.id, token, expiresAt }]
    });

    await writeStore(nextStore);

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://apexvault.icu"}/reset-password?token=${token}`;
    const t = Templates.passwordReset(resetLink);
    await sendEmail({ to: user.email, subject: t.subject, html: t.html });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}