import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { Store, DEFAULT_STORE } from "./adminStore";
import { sanitizeStore } from "./sanitizeStore";

const DATA_DIR = process.env.CRYPTO_DATA_DIR
  ? path.resolve(process.env.CRYPTO_DATA_DIR)
  : path.join(process.cwd(), "data");

const DB_FILE = path.join(DATA_DIR, "store.db");
const LEGACY_JSON_FILE = path.join(DATA_DIR, "store.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize Database
const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL"); // WAL mode is crucial for high-performance concurrent reads/writes
db.pragma("synchronous = NORMAL");

// Create the single-row table
db.exec(`
  CREATE TABLE IF NOT EXISTS store_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    version INTEGER NOT NULL
  );
`);

// -----------------------------------------
// ONE-TIME MIGRATION FROM JSON TO SQLITE
// -----------------------------------------
const rowCount = (db.prepare("SELECT COUNT(*) as count FROM store_data").get() as any).count;

if (rowCount === 0 && fs.existsSync(LEGACY_JSON_FILE)) {
  try {
    console.log("[serverStore] Migrating store.json to SQLite...");
    const raw = fs.readFileSync(LEGACY_JSON_FILE, "utf-8");
    const parsed = sanitizeStore(JSON.parse(raw));
    const version = Date.now();
    
    db.prepare("INSERT INTO store_data (id, data, version) VALUES (1, ?, ?)").run(
      JSON.stringify(parsed),
      version
    );
    
    console.log("[serverStore] Migration successful. Backing up old JSON file.");
    fs.renameSync(LEGACY_JSON_FILE, LEGACY_JSON_FILE + ".migrated.bak");
  } catch (err) {
    console.error("[serverStore] Migration failed:", err);
  }
}

// Prepare statements for speed
const getStmt = db.prepare("SELECT data, version FROM store_data WHERE id = 1");
const setStmt = db.prepare("INSERT OR REPLACE INTO store_data (id, data, version) VALUES (1, ?, ?)");

// In-memory cache (per server)
declare global {
  var __cryptoSiteStore: Store | undefined;
  var __cryptoSiteVersion: number | undefined;
}

export async function readStore(): Promise<{ store: Store; version: number }> {
  try {
    const row = getStmt.get() as { data: string; version: number } | undefined;
    
    if (row) {
      // If we have a cache and the version hasn't changed, return cache instantly
      if (globalThis.__cryptoSiteStore && globalThis.__cryptoSiteVersion === row.version) {
        return { store: globalThis.__cryptoSiteStore, version: row.version };
      }
      
      // Otherwise, parse the database data
      const parsed = sanitizeStore(JSON.parse(row.data));
      globalThis.__cryptoSiteStore = parsed;
      globalThis.__cryptoSiteVersion = row.version;
      return { store: parsed, version: row.version };
    }
  } catch (err) {
    console.error("[serverStore] SQLite read error:", err);
  }

  // Fallback to defaults if database is somehow empty
  const fresh = sanitizeStore(DEFAULT_STORE);
  await writeStore(fresh);
  return { store: fresh, version: Date.now() };
}

export async function writeStore(s: Store): Promise<number> {
  const sanitized = sanitizeStore(s);
  const version = Date.now();
  
  try {
    setStmt.run(JSON.stringify(sanitized), version);
    globalThis.__cryptoSiteStore = sanitized;
    globalThis.__cryptoSiteVersion = version;
    return version;
  } catch (err) {
    console.error("[serverStore] SQLite write error:", err);
    return 0;
  }
}

export function getVersion(): number {
  return globalThis.__cryptoSiteVersion ?? 0;
}