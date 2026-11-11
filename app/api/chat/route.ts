import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { chatBus } from "@/lib/chat-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DB_FILE = path.join(process.cwd(), "data", "store.db");

declare global {
  var __chatDb: Database.Database | undefined;
}
if (!globalThis.__chatDb) {
  globalThis.__chatDb = new Database(DB_FILE);
}
const db = globalThis.__chatDb;

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    attachment_type TEXT,
    attachment_url TEXT,
    created_at INTEGER NOT NULL
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
    const fullPath = path.join(dir, filename);
    await fs.promises.writeFile(fullPath, data);
    return `/uploads/chat/${filename}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const customerId = url.searchParams.get("customerId");

  if (action === "stream") {
    const stream = new ReadableStream({
      start(controller) {
        chatBus.addClient(controller);
        const interval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
          } catch {
            clearInterval(interval);
          }
        }, 15000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          chatBus.removeClient(controller);
        });
      },
      cancel(controller) {
        chatBus.removeClient(controller);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  if (action === "admin_list") {
    const rows = db.prepare(`
      SELECT customer_id, MAX(created_at) as last_msg,
             SUM(CASE WHEN sender_type = 'customer' AND is_read = 0 THEN 1 ELSE 0 END) as unread
      FROM chat_messages
      GROUP BY customer_id
      ORDER BY last_msg DESC
    `).all();
    return NextResponse.json(rows);
  }

  if (action === "history" && customerId) {
    const rows = db.prepare(`
      SELECT * FROM chat_messages
      WHERE customer_id = ?
      ORDER BY created_at ASC
    `).all(customerId);

    const isAdmin = url.searchParams.get("isAdmin") === "true";
    if (isAdmin) {
      db.prepare(`UPDATE chat_messages SET is_read = 1 WHERE customer_id = ? AND sender_type = 'customer'`).run(customerId);
    }

    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, senderType, message, attachment } = body;

    if (!customerId || !senderType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let attachmentUrl = null;
    if (attachment) {
      attachmentUrl = await saveImage(attachment, `${customerId}_${senderType}`);
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO chat_messages (id, customer_id, sender_type, message, attachment_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, customerId, senderType, message || "", attachmentUrl, createdAt);

    const newMsg = {
      id, customer_id: customerId, sender_type: senderType,
      message: message || "", attachment_url: attachmentUrl,
      created_at: createdAt, is_read: 0
    };

    chatBus.broadcast("new_message", newMsg);

    return NextResponse.json({ ok: true, message: newMsg });
  } catch (e) {
    console.error("Chat POST error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}