import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams.get("p") ?? "";
  const safe = p.split("/").filter(s => s && s !== "." && s !== ".." && !s.includes("\\"));
  if (safe.length === 0) return new NextResponse("Not found", { status: 404 });

  const full = path.join(UPLOAD_DIR, ...safe);
  // Belt-and-suspenders path traversal guard
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buf = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}