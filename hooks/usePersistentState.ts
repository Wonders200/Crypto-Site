"use client";
import { useEffect, useState } from "react";

/**
 * Persistent state with migration from any older version.
 * Reads from `key`. If missing, tries each key in `migrateFrom` in order,
 * takes the first that exists, writes it to `key`, and removes the old keys.
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
      const raw = localStorage.getItem(key);
      if (raw) {
        setV(JSON.parse(raw));
      } else if (migrateFrom.length > 0) {
        // Try each older key
        for (const oldKey of migrateFrom) {
          const old = localStorage.getItem(oldKey);
          if (old) {
            try {
              const parsed = JSON.parse(old) as T;
              setV(parsed);
              localStorage.setItem(key, JSON.stringify(parsed));
              // Clean up old keys so this doesn't happen again
              for (const k of migrateFrom) localStorage.removeItem(k);
              break;
            } catch {}
          }
        }
      }
    } catch {}
    setHydrated(true);
  }, [key]); // eslint-disable-line

  // Persist on change (only after hydration, to avoid overwriting stored data with initial)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v, hydrated]);

  return [v, setV] as const;
}