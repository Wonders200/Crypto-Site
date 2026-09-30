import { NextResponse } from "next/server";
import { readStore } from "@/lib/serverStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ultra-cheap version probe.
 * Returns 304 Not Modified if the client already has the current version.
 * Client sends: If-None-Match: "<version>"
 */
export async function GET(req: Request) {
  try {
    const { version } = await readStore();
    const ifNoneMatch = req.headers.get("if-none-match")?.replace(/"/g, "");

    if (ifNoneMatch && String(version) === String(ifNoneMatch)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-store",
          "ETag": `"${version}"`,
        },
      });
    }

    return new NextResponse(JSON.stringify({ version }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "ETag": `"${version}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}