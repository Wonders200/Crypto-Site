import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readStore, writeStore } from "@/lib/serverStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { verifyAdminSession, SESSION_COOKIE, hashPassword } from "@/lib/adminAuth";
import { uid } from "@/lib/adminStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkSuperAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const session = await verifyAdminSession(token);
  return session?.role === "superadmin";
}

export async function POST(req: Request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Only Super Admins can add team members." }, { status: 403 });
  }

  try {
    const { email, password, role } = await req.json();
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Email and min 8 char password required" }, { status: 400 });
    }

    const { store } = await readStore();
    const admins = store.admins || [];

    if (admins.some((a: any) => a.email === email)) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newAdmin = {
      id: uid("adm"),
      email: email.toLowerCase(),
      passwordHash,
      role: role === "superadmin" ? "superadmin" : "support",
      createdAt: Date.now()
    };

    const nextStore = sanitizeStore({ ...store, admins: [...admins, newAdmin] });
    await writeStore(nextStore);

    return NextResponse.json({ ok: true, admin: { email: newAdmin.email, role: newAdmin.role } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    const { store } = await readStore();
    const admins = store.admins || [];

    const nextStore = sanitizeStore({ ...store, admins: admins.filter((a: any) => a.id !== id) });
    await writeStore(nextStore);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}