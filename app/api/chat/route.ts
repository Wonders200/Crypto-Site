import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { chatBus } from "@/lib/chat-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DB_FILE = path.join(process.cwd(), "data", "store.db");

declare global { var __chatDb: Database.Database | undefined; }
if (!globalThis.__chatDb) { globalThis.__chatDb = new Database(DB_FILE); }
const db = globalThis.__chatDb;

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, sender_type TEXT NOT NULL,
    message TEXT, is_read INTEGER DEFAULT 0, attachment_type TEXT, attachment_url TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS chat_sessions (
    customer_id TEXT PRIMARY KEY, customer_last_seen INTEGER, admin_last_seen INTEGER
  );
`);

async function saveImage(base64Str: string, prefix: string): Promise<string | null> {
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const ext = matches[1].split('/')[1] || 'jpg';
    const data = Buffer.from(matches[2], 'base64');
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "chat");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(path.join(dir, filename), data);
    return `/uploads/chat/${filename}`;
  } catch { return null; }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const customerId = url.searchParams.get("customerId");

  if (action === "stream") {
    const stream = new ReadableStream({
      start(controller) {
        chatBus.addClient(controller);
        // Update last seen immediately on connection
        if (customerId) {
          const now = Date.now();
          db.prepare(`INSERT INTO chat_sessions (customer_id, customer_last_seen) VALUES (?, ?) ON CONFLICT(customer_id) DO UPDATE SET customer_last_seen = ?`).run(customerId, now, now);
          chatBus.broadcast("presence_update", { customerId, type: "customer", time: now });
        }

        const interval = setInterval(() => {
          try { controller.enqueue(new TextEncoder().encode(": heartbeat\n\n")); } 
          catch { clearInterval(interval); }
        }, 15000);
        req.signal.addEventListener("abort", () => { clearInterval(interval); chatBus.removeClient(controller); });
      },
      cancel(controller) { chatBus.removeClient(controller); }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive", "X-Accel-Buffering": "no",
      },
    });
  }

  if (action === "admin_list") {
    const rows = db.prepare(`
      SELECT m.customer_id, MAX(m.created_at) as last_msg,
             SUM(CASE WHEN m.sender_type = 'customer' AND m.is_read = 0 THEN 1 ELSE 0 END) as unread,
             s.customer_last_seen
      FROM chat_messages m 
      LEFT JOIN chat_sessions s ON m.customer_id = s.customer_id
      GROUP BY m.customer_id ORDER BY last_msg DESC
    `).all();
    return NextResponse.json(rows);
  }

  if (action === "history" && customerId) {
    const rows = db.prepare(`SELECT * FROM chat_messages WHERE customer_id = ? ORDER BY created_at ASC`).all(customerId);
    if (url.searchParams.get("isAdmin") === "true") {
      // Mark as read
      db.prepare(`UPDATE chat_messages SET is_read = 1 WHERE customer_id = ? AND sender_type = 'customer'`).run(customerId);
      // Broadcast read receipt to customer
      chatBus.broadcast("messages_read", { customerId });
      // Update admin last seen
      const now = Date.now();
      db.prepare(`INSERT INTO chat_sessions (customer_id, admin_last_seen) VALUES (?, ?) ON CONFLICT(customer_id) DO UPDATE SET admin_last_seen = ?`).run(customerId, now, now);
      chatBus.broadcast("presence_update", { customerId, type: "admin", time: now });
    }
    return NextResponse.json(rows);
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "ping") {
      const { customerId, type } = await req.json();
      if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
      const now = Date.now();
      if (type === "admin") {
        db.prepare(`INSERT INTO chat_sessions (customer_id, admin_last_seen) VALUES (?, ?) ON CONFLICT(customer_id) DO UPDATE SET admin_last_seen = ?`).run(customerId, now, now);
        chatBus.broadcast("presence_update", { customerId, type: "admin", time: now });
      } else {
        db.prepare(`INSERT INTO chat_sessions (customer_id, customer_last_seen) VALUES (?, ?) ON CONFLICT(customer_id) DO UPDATE SET customer_last_seen = ?`).run(customerId, now, now);
        chatBus.broadcast("presence_update", { customerId, type: "customer", time: now });
      }
      return NextResponse.json({ ok: true });
    }

    const { customerId, senderType, message, attachment } = await req.json();
    if (!customerId || !senderType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    
    let attachmentUrl = attachment ? await saveImage(attachment, `${customerId}_${senderType}`) : null;
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO chat_messages (id, customer_id, sender_type, message, attachment_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, customerId, senderType, message || "", attachmentUrl, createdAt);

    const newMsg = { id, customer_id: customerId, sender_type: senderType, message: message || "", attachment_url: attachmentUrl, created_at: createdAt, is_read: 0 };
    chatBus.broadcast("new_message", newMsg);
    return NextResponse.json({ ok: true, message: newMsg });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}