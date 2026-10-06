"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Store, DEFAULT_STORE } from "@/lib/adminStore";
import { sanitizeStore } from "@/lib/sanitizeStore";
import { apiFetch } from "@/lib/apiClient";

const STORE_CACHE_KEY = "cs.store.cache";
const VERSION_CACHE_KEY = "cs.store.version";

/**
 * Fast server-backed store with:
 *   localStorage cache (instant hydration on page load)
 *   ETag/304  poll returns empty body when nothing changed
 *   5-second polling (was 1.5s)
 *   Optimistic local updates
 *   Background revalidation
 */
export function useServerStore() {
  // Seed with cache so first render already has data
  const [store, setStore] = useState<Store>(() => {
    if (typeof window === "undefined") return DEFAULT_STORE;
    try {
      // Demo mode: use isolated demo store, never touch production cache
      if (localStorage.getItem("cs.demoMode")) {
        const demoRaw = localStorage.getItem("demo.cs.store");
        if (demoRaw) return JSON.parse(demoRaw);
        return DEFAULT_STORE;
      }
      const cached = localStorage.getItem(STORE_CACHE_KEY);
      if (cached) return sanitizeStore(JSON.parse(cached));
    } catch {}
    return DEFAULT_STORE;
  });
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [online, setOnline] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const lastKnownVersion = useRef<number>(0);
  const pendingWrites = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load cached version on mount so the first poll can send If-None-Match
  useEffect(() => {
    try {
      const cachedV = localStorage.getItem(VERSION_CACHE_KEY);
      if (cachedV) lastKnownVersion.current = parseInt(cachedV, 10) || 0;
    } catch {}
  }, []);

  const saveCache = useCallback((s: Store, v: number) => {
    try {
      localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(s));
      localStorage.setItem(VERSION_CACHE_KEY, String(v));
    } catch {}
  }, []);

  /* -------- Fetch the full store -------- */
  const fetchFull = useCallback(async () => {
    // Demo mode: never hit the server
    if (typeof window !== "undefined" && localStorage.getItem("cs.demoMode")) {
      setLoaded(true);
      setOnline(true);
      setLastSyncAt(Date.now());
      return;
    }
    try {
      const headers: HeadersInit = {};
      if (lastKnownVersion.current) headers["If-None-Match"] = `"${lastKnownVersion.current}"`;

      const res = await fetch("/api/store", { headers, cache: "no-store" });

      if (res.status === 304) {
        // Nothing changed  great
        setOnline(true);
        setLastSyncAt(Date.now());
        return;
      }

      if (!res.ok) { setOnline(false); return; }
      const data = await res.json();
      if (data?.store) {
        const sanitized = sanitizeStore(data.store);
        setStore(sanitized);
        lastKnownVersion.current = data.version ?? 0;
        saveCache(sanitized, data.version ?? 0);
        setLastSyncAt(Date.now());
      }
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [saveCache]);

  /* -------- Initial load -------- */
  useEffect(() => {
    (async () => {
      await fetchFull();
      setLoaded(true);
    })();
  }, [fetchFull]);

  /* -------- Poll version (5s, ETag-optimized) -------- */
  useEffect(() => {
    const tick = async () => {
      if (isDemoNow()) return;
      if (pendingWrites.current > 0) return;
      try {
        const headers: HeadersInit = {};
        if (lastKnownVersion.current) headers["If-None-Match"] = `"${lastKnownVersion.current}"`;

        const res = await fetch("/api/store/version", { headers, cache: "no-store" });

        if (res.status === 304) {
          // Not modified  zero body, zero parse
          setOnline(true);
          return;
        }

        if (!res.ok) { setOnline(false); return; }
        const { version } = await res.json();
        setOnline(true);
        if (version && version !== lastKnownVersion.current) {
          await fetchFull();
        }
      } catch {
        setOnline(false);
      }
    };
    pollRef.current = setInterval(tick, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchFull]);

  /* -------- Writer (auth-aware, optimistic) -------- */
  const update = useCallback(<K extends keyof Store>(key: K, value: Store[K]) => {
    // Demo mode is READ-ONLY: ignore all writes, log a warning
    if (isDemoNow()) {
      if (typeof window !== "undefined") {
        try {
          // Dispatch a global event so the banner can show a "read-only" toast
          window.dispatchEvent(new CustomEvent("demo:readonly-attempt", { detail: { key } }));
        } catch {}
      }
      return;
    }
    setStore(prev => {
      const next = { ...prev, [key]: value };
      // Optimistic local update first
      saveCache(next, lastKnownVersion.current);

      pendingWrites.current += 1;
      setSyncing(true);
      setLastError(null);

      Promise.resolve()
        .then(async () => {
          try {
            const res = await apiFetch("/api/store", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ store: next }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.version) {
                lastKnownVersion.current = data.version;
                saveCache(next, data.version);
              }
              setLastSyncAt(Date.now());
              setOnline(true);
            } else {
              const errBody = await res.text().catch(() => "");
              setOnline(false);
              setLastError(`HTTP ${res.status}: ${errBody.slice(0, 200)}`);
            }
          } catch (e) {
            setOnline(false);
            setLastError((e as Error).message);
          } finally {
            pendingWrites.current = Math.max(0, pendingWrites.current - 1);
            if (pendingWrites.current === 0) setSyncing(false);
          }
        });

      return next;
    });
  }, [saveCache]);

  const replace = useCallback((s: Store) => {
    if (isDemoNow()) {
      if (typeof window !== "undefined") {
        try { window.dispatchEvent(new CustomEvent("demo:readonly-attempt", { detail: { key: "replace" } })); } catch {}
      }
      return;
    }
    setStore(s);
    saveCache(s, lastKnownVersion.current);
    pendingWrites.current += 1;
    setSyncing(true);
    apiFetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store: s }),
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data?.version) {
            lastKnownVersion.current = data.version;
            saveCache(s, data.version);
          }
          setLastSyncAt(Date.now());
          setOnline(true);
        }
      })
      .catch(() => setOnline(false))
      .finally(() => {
        pendingWrites.current = Math.max(0, pendingWrites.current - 1);
        if (pendingWrites.current === 0) setSyncing(false);
      });
  }, [saveCache]);

  const resetStore = useCallback(() => replace(DEFAULT_STORE), [replace]);

  return { store, loaded, syncing, online, lastSyncAt, lastError, update, replace, resetStore };
}