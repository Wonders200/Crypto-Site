import { NextResponse } from "next/server";
import { readStore, writeStore, getVersion } from "@/lib/serverStore";
import { findKycMismatches } from "@/lib/kyc";
import { sanitizeStore } from "@/lib/sanitizeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  return the store with ETag support.
 * If the client already has the current version, returns 304 (empty body).
 */
export async function GET(req: Request) {
  try {
    const { store, version } = await readStore();
    const ifNoneMatch = req.headers.get("if-none-match")?.replace(/"/g, "");

    // Server-side KYC self-heal (only when a write is needed)
    const mismatches = findKycMismatches(store);
    let finalStore = store;
    let finalVersion = version;

    if (mismatches.length > 0) {
      finalStore = {
        ...store,
        users: store.users.map(u => {
          const m = mismatches.find(x => x.userId === u.id);
          if (!m) return u;
          return { ...u, kycStatus: m.newStatus, kycVerified: m.newStatus === "verified" };
        }),
      };
      finalVersion = await writeStore(finalStore);
    }

    // 304 Not Modified  client already has this version
    if (ifNoneMatch && String(finalVersion) === String(ifNoneMatch)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-store",
          "ETag": `"${finalVersion}"`,
        },
      });
    }

    return new NextResponse(JSON.stringify({ store: finalStore, version: finalVersion }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "ETag": `"${finalVersion}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** POST  replace the store, self-heal KYC */
export async function POST(req: Request) {
  // READ-ONLY DEMO: reject all writes when on the demo server
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.CRYPTO_DATA_DIR === "data-demo") {
    return NextResponse.json(
      { error: "Demo mode is read-only. Purchase to unlock full editing." },
      { status: 403 }
    );
  }
  try {
    const body = await req.json();
    const incoming = body?.store ?? body;
    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const mismatches = findKycMismatches(incoming);
    let toSave = incoming;
    if (mismatches.length > 0) {
      toSave = {
        ...incoming,
        users: (incoming.users ?? []).map((u: any) => {
          const m = mismatches.find(x => x.userId === u.id);
          if (!m) return u;
          return { ...u, kycStatus: m.newStatus, kycVerified: m.newStatus === "verified" };
        }),
      };
    }

    const version = await writeStore(sanitizeStore(toSave));
    return new NextResponse(JSON.stringify({ ok: true, version }), {
      status: 200,
      headers: { "Content-Type": "application/json", "ETag": `"${version}"` },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}