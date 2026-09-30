import { NextResponse } from "next/server";
import { uploadDataUrl, hasS3 } from "@/lib/storage";
import { uid } from "@/lib/adminStore";
import { captureError } from "@/lib/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dataUrl = String(body?.dataUrl ?? "");
    const kind = String(body?.kind ?? "screenshot");
    if (!dataUrl.startsWith("data:")) return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });

    const ext = dataUrl.match(/^data:image\/(\w+)/)?.[1] ?? "jpg";
    const key = `uploads/${kind}/${new Date().toISOString().slice(0, 10)}/${uid("f")}.${ext}`;
    const url = await uploadDataUrl(dataUrl, key);
    return NextResponse.json({ ok: true, url, storage: hasS3() ? "s3" : "inline" });
  } catch (e) {
    captureError(e, { route: "/api/upload" });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}