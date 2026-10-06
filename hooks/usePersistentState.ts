"use client";
import { useEffect, useState } from "react";

/**
 * Returns the actual storage key to use, prefixing with "demo." when
 * the user is in demo mode. This keeps demo data isolated from production.
 */
function resolveKey(key: string): string {
  if (typeof window === "undefined") return key;
  try {
    if (localStorage.getItem("cs.demoMode")) return "demo." + key;
  } catch {}
  return key;
}

/**
 * Persistent state with migration from any older version.
 * Demo-aware: uses "demo." prefix when in demo mode so demo data
 * never touches production localStorage keys.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  migrateFrom: string[] = []
) {
  const [v, setV] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    try {
      const actualKey = resolveKey(key);
      const raw = localStorage.getItem(actualKey);
      if (raw) {
        setV(JSON.parse(raw));
      } else if (!actualKey.startsWith("demo.") && migrateFrom.length > 0) {
        for (const oldKey of migrateFrom) {
          const old = localStorage.getItem(oldKey);
          if (old) {
            try {
              const parsed = JSON.parse(old) as T;
              setV(parsed);
              localStorage.setItem(actualKey, JSON.stringify(parsed));
              for (const k of migrateFrom) localStorage.removeItem(k);
              break;
            } catch {}
          }
        }
      }
    } catch {}
    setHydrated(true);
  }, [key]);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(resolveKey(key), JSON.stringify(v));
    } catch {}
  }, [key, v, hydrated]);

  return [v, setV] as const;
}
