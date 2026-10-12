import { NextResponse } from "next/server";
import { sendEmail, hasEmail, Templates } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "";
  if (!to) return NextResponse.json({ error: "?to=email required" }, { status: 400 });

  const configured = hasEmail();
  if (!configured) {
    return NextResponse.json({ ok: false, reason: "RESEND_API_KEY not set in this process", configured });
  }

  const t = Templates.kycApproved("Test User");
  const sent = await sendEmail({ to, subject: t.subject, html: t.html });
  return NextResponse.json({ ok: sent, to, subject: t.subject, configured });
}