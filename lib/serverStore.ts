import fs from "fs/promises";
import fssync from "fs";
import path from "path";
import { Store, DEFAULT_STORE } from "./adminStore";
import { sanitizeStore } from "./sanitizeStore";

/* =====================================================================
   Multi-server-safe file store.

   Works across N servers when all servers share the same
   DATA_DIR (NFS, SMB, Azure Files, EFS, a mounted volume in k8s, etc.).

   Guarantees:
      Atomic writes  temp file + rename (POSIX atomic on the same FS)
      Cache invalidation  every read checks file mtime; if it changed
       on ANY server, this server reloads from disk
      No in-process cross-talk  each server always serves the truth

   The public API is identical to before.
   ===================================================================== */

const DATA_DIR = process.env.CRYPTO_DATA_DIR
  ? path.resolve(process.env.CRYPTO_DATA_DIR)
  : path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const LOCK_FILE = path.join(DATA_DIR, "store.lock");
const VERSION_FILE = path.join(DATA_DIR, "store.version");

/* -------------------- In-process cache (per server) -------------------- */
declare global {
  // eslint-disable-next-line no-var
  var __cryptoSiteStore: Store | undefined;
  // eslint-disable-next-line no-var
  var __cryptoSiteVersion: number | undefined;
  // eslint-disable-next-line no-var
  var __cryptoSiteMtime: number | undefined;
}

function touchMtime(ms: number) {
  globalThis.__cryptoSiteMtime = ms;
  globalThis.__cryptoSiteVersion = ms;
}

/* -------------------- File-mtime probe -------------------- */
async function currentMtime(): Promise<number> {
  try {
    const st = await fs.stat(STORE_FILE);
    return st.mtimeMs;
  } catch {
    return 0;
  }
}

/* -------------------- Atomic write -------------------- */
async function atomicWrite(file: string, content: string): Promise<void> {
  const tmp = `${file}.tmp.${process.pid}.${Date.now()}`;
  await fs.writeFile(tmp, content, "utf-8");
  await fs.rename(tmp, file);   // atomic on same filesystem
}

/* -------------------- Simple cross-process file lock -------------------- */
/* Uses O_EXCL to create a lock file  fails immediately if held by another
   process. Falls back to a time-based stale-lock cleanup. */
async function acquireLock(timeoutMs = 3000): Promise<() => Promise<void>> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const fd = fssync.openSync(LOCK_FILE, "wx");
      fssync.closeSync(fd);
      await fs.writeFile(LOCK_FILE, String(process.pid));
      return async () => { try { await fs.unlink(LOCK_FILE); } catch {} };
    } catch {
      // Someone else holds the lock. Check if it's stale (older than 10s)
      try {
        const st = await fs.stat(LOCK_FILE);
        if (Date.now() - st.mtimeMs > 10_000) {
          await fs.unlink(LOCK_FILE).catch(() => {});
          continue;
        }
      } catch {}
      await new Promise(r => setTimeout(r, 50));
    }
  }
  // Timeout  proceed without lock (fail-open, log it)
  console.warn("[serverStore] Lock acquisition timed out; proceeding");
  return async () => {};
}

/* -------------------- Read (with mtime invalidation) -------------------- */
export async function readStore(): Promise<{ store: Store; version: number }> {
  // Fast path: check mtime against our cached mtime
  const diskMtime = await currentMtime();

  //  CACHE BUST MARKER 
  // If this file exists, force a fresh read from disk regardless of mtime.
  // Used to break out of stale-cache situations like an admin value change.
  const BUST_MARKER = path.join(DATA_DIR, "cache.bust");
  try {
    await fs.stat(BUST_MARKER);
    // Marker exists  clear cache and delete marker
    globalThis.__cryptoSiteStore = undefined;
    globalThis.__cryptoSiteMtime = undefined;
    globalThis.__cryptoSiteVersion = undefined;
    await fs.unlink(BUST_MARKER).catch(() => {});
  } catch {}

  // Cache is valid only if disk hasn't changed since we cached it
  if (
    globalThis.__cryptoSiteStore &&
    globalThis.__cryptoSiteMtime === diskMtime &&
    diskMtime > 0
  ) {
    return { store: globalThis.__cryptoSiteStore, version: globalThis.__cryptoSiteVersion ?? 0 };
  }

  // Otherwise reload from disk
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeStore(parsed);
    globalThis.__cryptoSiteStore = sanitized;
    touchMtime(diskMtime);
    return { store: sanitized, version: diskMtime };
  } catch {
    // File missing  initialize with defaults
    const fresh = sanitizeStore(DEFAULT_STORE);
    await writeStore(fresh);
    return { store: fresh, version: globalThis.__cryptoSiteVersion ?? 0 };
  }
}

/* -------------------- Write (atomic + locked) -------------------- */
export async function writeStore(s: Store): Promise<number> {
  const sanitized = sanitizeStore(s);
  await fs.mkdir(DATA_DIR, { recursive: true });

  const release = await acquireLock();
  try {
    const serialized = JSON.stringify(sanitized, null, 2);
    await atomicWrite(STORE_FILE, serialized);

    // Bump a version marker file so other servers can detect the change
    const stamp = Date.now();
    await atomicWrite(VERSION_FILE, String(stamp));

    // Update our own cache
    const diskMtime = await currentMtime();
    globalThis.__cryptoSiteStore = sanitized;
    touchMtime(diskMtime || stamp);

    return globalThis.__cryptoSiteVersion ?? stamp;
  } finally {
    await release();
  }
}

export function getVersion(): number {
  return globalThis.__cryptoSiteVersion ?? 0;
}