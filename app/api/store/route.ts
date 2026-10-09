import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { Store } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * If a value is a base64 data URL, write it to disk and return a small URL.
 * Otherwise return the value unchanged.
 */
async function externalizeDataUrl(value: any, subfolder: string, idHint: string): Promise<any> {
  if (typeof value !== "string") return value;
  if (!value.startsWith("data:")) return value;
  const m = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!m) return value;
  const mime = m[1];
  const b64 = m[2];
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const hash = crypto.createHash("sha1").update(b64).digest("hex").slice(0, 16);
  const filename = idHint + "_" + hash + "." + ext;
  const dir = path.join(UPLOAD_DIR, subfolder);
  await fs.mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  try {
    await fs.access(full);
  } catch {
    await fs.writeFile(full, Buffer.from(b64, "base64"));
  }
  return "/api/uploads?p=" + encodeURIComponent(subfolder + "/" + filename);
}

async function externalizeStore(store: Store): Promise<Store> {
  const out: any = { ...store };

  if (Array.isArray(out.kycSubmissions)) {
    out.kycSubmissions = await Promise.all(
      out.kycSubmissions.map(async (s: any) => {
        const r = { ...s };
        if (r.idFrontUrl) r.idFrontUrl = await externalizeDataUrl(r.idFrontUrl, "kyc", (r.id || "kyc") + "_front");
        if (r.idBackUrl)  r.idBackUrl  = await externalizeDataUrl(r.idBackUrl,  "kyc", (r.id || "kyc") + "_back");
        if (r.selfieUrl)  r.selfieUrl  = await externalizeDataUrl(r.selfieUrl,  "kyc", (r.id || "kyc") + "_selfie");
        return r;
      })
    );
  }

  if (Array.isArray(out.transactions)) {
    out.transactions = await Promise.all(
      out.transactions.map(async (t: any) => {
        const r = { ...t };
        if (r.proofUrl) r.proofUrl = await externalizeDataUrl(r.proofUrl, "proofs", (r.id || "tx") + "_proof");
        return r;
      })
    );
  }

  return out as Store;
}

export async function GET() {
  const { store, version } = await readStore();
  return NextResponse.json({ store, version }, {
    headers: { "Cache-Control": "no-store", "ETag": `"${version}"` },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // MERGE-BY MODE: { key, value: [...], mergeBy: "userId" }
    if (body && typeof body.key === "string" && Array.isArray(body.value) && body.mergeBy) {
      const { store: current } = await readStore();
      const currentArr: any[] = (current as any)[body.key] ?? [];
      const incomingArr: any[] = body.value;
      const idField = body.mergeBy as string;

      const map = new Map();
      currentArr.forEach(item => map.set(item[idField], item));
      incomingArr.forEach(item => {
        if (item && item[idField] !== undefined) map.set(item[idField], item);
      });
      const merged = Array.from(map.values());

      let next = sanitizeStore({ ...current, [body.key]: merged } as Store);
      next = await externalizeStore(next);
      const version = await writeStore(next);
      return NextResponse.json({ ok: true, version, mode: "mergeBy" });
    }

    // DELTA MODE: { key, value }
    if (body && typeof body.key === "string" && body.value !== undefined) {
      const { store: current } = await readStore();
      let next = sanitizeStore({ ...current, [body.key]: body.value } as Store);
      next = await externalizeStore(next);
      const version = await writeStore(next);
      return NextResponse.json({ ok: true, version, mode: "delta" });
    }

    // LEGACY: { store }
    if (body && body.store && typeof body.store === "object") {
      const { store: current } = await readStore();
      let incoming = sanitizeStore(body.store);
      const currentHasData = (current.users?.length ?? 0) > 0;
      const incomingHasData = (incoming.users?.length ?? 0) > 0;
      if (currentHasData && !incomingHasData) {
        return NextResponse.json({ error: "Refused to wipe populated store" }, { status: 409 });
      }
      incoming = await externalizeStore(incoming);
      const version = await writeStore(incoming);
      return NextResponse.json({ ok: true, version, mode: "legacy" });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}