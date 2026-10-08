import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { Store } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { store, version } = await readStore();
  return NextResponse.json({ store, version }, {
    headers: { "Cache-Control": "no-store", "ETag": `"${version}"` }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // DELTA MODE: { key: "users", value: [...] }  always safe, merges into current
    if (body && typeof body.key === "string" && body.value !== undefined) {
      const { store: current } = await readStore();
      const merged = sanitizeStore({ ...current, [body.key]: body.value } as Store);
      const version = await writeStore(merged);
      return NextResponse.json({ ok: true, version, mode: "delta" });
    }

    // LEGACY MODE: { store: {...} }  refuse if it would wipe a populated store
    if (body && body.store && typeof body.store === "object") {
      const { store: current } = await readStore();
      const incoming = sanitizeStore(body.store);
      const currentHasData = (current.users?.length ?? 0) > 0;
      const incomingHasData = (incoming.users?.length ?? 0) > 0;

      if (currentHasData && !incomingHasData) {
        return NextResponse.json(
          { error: "Refused to overwrite populated store with empty payload" },
          { status: 409 }
        );
      }
      const version = await writeStore(incoming);
      return NextResponse.json({ ok: true, version, mode: "legacy" });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}