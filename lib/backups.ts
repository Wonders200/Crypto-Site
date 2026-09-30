import fs from "fs/promises";
import path from "path";

const DATA_DIR = process.env.CRYPTO_DATA_DIR
  ? path.resolve(process.env.CRYPTO_DATA_DIR)
  : path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const KEEP = 30;

/** Copies store.json to backups/store-YYYY-MM-DD.json, prunes old backups. */
export async function runBackup(): Promise<string | null> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    const target = path.join(BACKUP_DIR, `store-${stamp}.json`);

    // Skip if today's backup exists
    try { await fs.stat(target); return target; } catch {}

    const src = await fs.readFile(STORE_FILE, "utf-8");
    await fs.writeFile(target, src, "utf-8");

    // Prune old backups
    const files = (await fs.readdir(BACKUP_DIR))
      .filter(f => f.startsWith("store-") && f.endsWith(".json"))
      .sort()
      .reverse();
    for (const f of files.slice(KEEP)) {
      await fs.unlink(path.join(BACKUP_DIR, f)).catch(() => {});
    }

    return target;
  } catch (e) {
    console.error("[backup] failed", e);
    return null;
  }
}