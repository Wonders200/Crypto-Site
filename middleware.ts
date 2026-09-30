import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect state-changing API routes.
 * Public reads and auth endpoints stay open.
 * Admin routes require the admin cookie/localStorage token.
 */

const PUBLIC_WRITE_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/upload",
  "/api/whoami",
  "/api/backup",
  "/api/store",      // store writes carry their own Bearer token,
                     // but we allow anonymous writes for onboarding flows
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /api/* POST/PUT/PATCH/DELETE
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return NextResponse.next();

  // Public write endpoints
  if (PUBLIC_WRITE_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Require a Bearer token
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};