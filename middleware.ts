import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Two layers of protection:
 *   1. Admin PAGES  (/admin/*)  require a valid JWT session cookie
 *   2. API WRITES   (/api/* POST/PUT/PATCH/DELETE)  require a Bearer token
 *      (except the public endpoints listed below)
 */

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-only-admin-secret-change-me"
);
const SESSION_COOKIE = "apexvault_admin_session";

const PUBLIC_WRITE_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/upload",
  "/api/whoami",
  "/api/backup",
  "/api/store",
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin PAGE protection ---
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, ADMIN_JWT_SECRET);
      return NextResponse.next();
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- API write protection (unchanged behavior) ---
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return NextResponse.next();
  if (PUBLIC_WRITE_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};