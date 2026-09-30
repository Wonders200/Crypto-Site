import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backups";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST  runs a backup. Called automatically on server start and daily. */
export async function POST() {
  const path = await runBackup();
  return NextResponse.json({ ok: true, path });
}

export async function GET() {
  const path = await runBackup();
  return NextResponse.json({ ok: true, path });
}