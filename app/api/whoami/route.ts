import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the calling client's IP address + basic request metadata.
 * Reads standard proxy headers so it works behind Nginx, Cloudflare,
 * Vercel, or any load balancer.
 */
export async function GET(req: Request) {
  // Priority order for finding the real client IP
  const xff = req.headers.get("x-forwarded-for");
  const xri = req.headers.get("x-real-ip");
  const cf = req.headers.get("cf-connecting-ip");
  const vercel = req.headers.get("x-vercel-forwarded-for");

  let ip =
    (cf ?? "").trim() ||
    (vercel ?? "").split(",")[0]?.trim() ||
    (xff ?? "").split(",")[0]?.trim() ||
    (xri ?? "").trim() ||
    "";

  // If still empty, try to fall back  but on Next.js App Router
  // we don't have direct access to req.socket from the Request object.
  if (!ip) ip = "unknown";

  // Normalize localhost / IPv6-mapped IPv4
  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

  const ua = req.headers.get("user-agent") ?? "";
  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const acceptEncoding = req.headers.get("accept-encoding") ?? "";
  const referer = req.headers.get("referer") ?? "";

  return NextResponse.json({
    ip,
    userAgent: ua,
    acceptLanguage,
    acceptEncoding,
    referer,
    at: Date.now(),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}