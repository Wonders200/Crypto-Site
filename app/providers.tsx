"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useServerStore } from "@/hooks/useServerStore";
import { Store, DEFAULT_STORE, AuditEntry, uid, DEFAULT_DEMO_USER, AdminSession, AdminUser, KycStatus } from "@/lib/adminStore";
import { generateDailyNews } from "@/lib/newsEngine";
import { parseUA } from "@/lib/parseUA";
import { findKycMismatches } from "@/lib/kyc";

/* -------- Toasts -------- */
type Toast = { id: number; kind: "success" | "error" | "info"; title: string; message?: string };
const ToastCtx = createContext<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void } | null>(null);
export function useToast() { const c = useContext(ToastCtx); if (!c) throw new Error("useToast outside Providers"); return c; }

/* -------- User auth -------- */
type User = { email: string; name: string; tier: "Standard" | "Pro" | "Institutional"; password?: string } | null;
type AuthCtx = { user: User; sessionId: string | null; login: (u: User) => void; logout: () => void; };
const AuthContext = createContext<AuthCtx | null>(null);
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error("useAuth outside Providers"); return c; }

/* -------- Watchlist -------- */
const WatchCtx = createContext<{ watchlist: string[]; toggle: (id: string) => void; has: (id: string) => boolean } | null>(null);
export function useWatchlist() { const c = useContext(WatchCtx); if (!c) throw new Error("useWatchlist outside Providers"); return c; }

/* -------- Holdings -------- */
export interface Holding { coinId: string; amount: number; avgBuyPrice: number; acquiredAt: number; }
const PortCtx = createContext<{ holdings: Holding[]; addHolding: (h: Holding) => void; removeHolding: (coinId: string) => void; } | null>(null);
export function usePortfolio() { const c = useContext(PortCtx); if (!c) throw new Error("usePortfolio outside Providers"); return c; }

/* -------- Admin Store -------- */
type AdminStoreCtx = {
  store: Store;
  loaded: boolean;
  syncing: boolean;
  online: boolean;
  lastSyncAt: number | null;
  resetStore: () => void;
  update: <K extends keyof Store>(key: K, value: Store[K]) => void;
  log: (action: string, target: string, details?: string) => void;
  replace: (s: Store) => void;
  refreshNews: (opts?: { force?: boolean; count?: number }) => number;
};
const AdminStoreContext = createContext<AdminStoreCtx | null>(null);
export function useAdminStore() { const c = useContext(AdminStoreContext); if (!c) throw new Error("useAdminStore outside Providers"); return c; }

/* -------- Admin auth -------- */
type AdminAuthSession = { email: string; signedInAt: number } | null;
const AdminAuthCtx = createContext<{
  admin: AdminAuthSession;
  loginAdmin: (email: string, password: string) => { ok: boolean; error?: string };
  logoutAdmin: () => void;
} | null>(null);
export function useAdminAuth() { const c = useContext(AdminAuthCtx); if (!c) throw new Error("useAdminAuth outside Providers"); return c; }

/* -------- Root -------- */
export function Providers({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = usePersistentState<Toast[]>("cs.toasts", []);
  const staleToastsCleared = useRef(false);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { ...t, id }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 8000);
  }, []);
  const dismiss = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  const [user, setUser] = usePersistentState<User>("cs.user", null);
  const [sessionId, setSessionId] = usePersistentState<string | null>("cs.sessionId", null);
  const [watchlist, setWatchlist] = usePersistentState<string[]>("cs.watchlist", ["bitcoin", "ethereum", "solana"]);
  const [holdings, setHoldings] = usePersistentState<Holding[]>("cs.holdings", []);
  const [admin, setAdmin] = usePersistentState<AdminAuthSession>("cs.admin", null);

  /* ============================================================
     SERVER-BACKED STORE  the single source of truth.
     Every browser reads and writes the same server state.
     ============================================================ */
  const {
    store,
    loaded,
    syncing,
    online,
    lastSyncAt,
    update: serverUpdate,
    replace: serverReplace,
    resetStore: serverReset,
  } = useServerStore();

  /* -------- log() writes to audit via the server store -------- */
  const log = useCallback((action: string, target: string, details?: string) => {
    const entry: AuditEntry = { id: uid("a"), at: Date.now(), actor: admin?.email ?? "system", action, target, details };
    // read latest from server state via the update callback
    serverUpdate("audit", [entry, ...(store.audit ?? [])].slice(0, 500));
  }, [serverUpdate, admin, store.audit]);

  /* -------- update passthrough -------- */
  const update = useCallback(<K extends keyof Store>(key: K, value: Store[K]) => {
    serverUpdate(key, value);
  }, [serverUpdate]);

  /* -------- news refresh -------- */
  const refreshNews = useCallback((opts?: { force?: boolean; count?: number }): number => {
    const meta = store.newsMeta ?? DEFAULT_STORE.newsMeta;
    if (!opts?.force) {
      if (!meta.autoRefresh) return 0;
      const hours = (Date.now() - meta.lastRefresh) / 3600000;
      if (hours < meta.refreshIntervalHours) return 0;
    }
    const batch = generateDailyNews((store.coins ?? []).filter(c => c.enabled), opts?.count ?? 8);
    if (batch.length === 0) return 0;
    const cutoff = Date.now() - 7 * 86400000;
    const kept = (store.news ?? []).filter(n => n.pinned || n.origin === "manual" || n.publishedAt > cutoff);
    const titles = new Set(kept.map(n => n.title));
    const toAdd = batch.filter(n => !titles.has(n.title));
    const merged = [...toAdd, ...kept].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt - a.publishedAt).slice(0, meta.maxArticles ?? 60);
    serverUpdate("news", merged);
    serverUpdate("newsMeta", { ...meta, lastRefresh: Date.now() });
    return toAdd.length;
  }, [serverUpdate, store.coins, store.news, store.newsMeta]);

  /* -------- Clear toasts older than 1 minute on first mount -------- */
  useEffect(() => {
    if (staleToastsCleared.current) return;
    staleToastsCleared.current = true;
    const now = Date.now();
    setToasts(prev => prev.filter(t => (now - t.id) < 60000));
  }, []); // eslint-disable-line


  /* ============================================================
     KYC SELF-HEAL  keep user records in sync with submissions.
     Runs whenever the store loads. If a submission says "verified"
     but the user record doesn't, we backfill it once. Approval
     sticks permanently.
     ============================================================ */
  useEffect(() => {
    if (!loaded) return;
    const mismatches = findKycMismatches(store);
    if (mismatches.length === 0) return;
    console.log("[kyc-sync] healing", mismatches.length, "user(s)", mismatches);
    const healed = (store.users ?? []).map(u => {
      const m = mismatches.find(x => x.userId === u.id);
      if (!m) return u;
      return {
        ...u,
        kycStatus: m.newStatus,
        kycVerified: m.newStatus === "verified",
      };
    });
    serverUpdate("users", healed);
  }, [loaded, store.users, store.kycSubmissions]); // eslint-disable-line
  /* -------- user login (server-aware) -------- */
  const login = useCallback((u: User) => {
    if (!u) { setUser(null); setSessionId(null); return; }

    const existing = (store.users ?? []).find(x => x.email.toLowerCase() === u.email.toLowerCase());
    let userId = existing?.id;
    if (!userId) {
      userId = uid("u");
      const newUser: AdminUser = {
        id: userId,
        name: u.name,
        email: u.email,
        tier: u.tier,
        status: "active",
        kycVerified: false,
        kycStatus: "unverified" as KycStatus,
        createdAt: Date.now(),
        password: u.password,
      };
      serverUpdate("users", [newUser, ...(store.users ?? [])]);
      if (!(store.balances ?? []).some(b => b.userId === userId)) {
        serverUpdate("balances", [{ userId, usd: 0, locked: 0, updatedAt: Date.now() }, ...(store.balances ?? [])]);
      }
    }

    const sid = uid("s");
    const rawUA = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    const parsed = parseUA(rawUA);

    // Create the session immediately with what we have
    const sess: AdminSession = {
      id: sid, userId, email: u.email, name: u.name,
      startedAt: Date.now(), lastSeenAt: Date.now(), active: true,
      userAgent: rawUA.slice(0, 200),
      ip: undefined,
      browser: parsed.browser,
      browserVersion: parsed.browserVersion,
      os: parsed.os,
      osVersion: parsed.osVersion,
      deviceType: parsed.deviceType,
    };

    const closed = (store.sessions ?? []).map(s => s.userId === userId && s.active ? { ...s, active: false, endedAt: Date.now() } : s);
    serverUpdate("sessions", [sess, ...closed].slice(0, 200));

    setUser(u);
    setSessionId(sid);

    // Fetch IP + richer info asynchronously and patch the session
    fetch("/api/whoami", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // Update the stored session with the IP
        // We read from the freshest store snapshot available in this closure
        const currentSessions = (store.sessions ?? []);
        const updated = [sess, ...closed]
          .slice(0, 200)
          .map(s => s.id === sid ? { ...s, ip: data.ip ?? undefined } : s);
        serverUpdate("sessions", updated);
      })
      .catch(() => {});
  }, [store.users, store.balances, store.sessions, serverUpdate, setUser, setSessionId]);

  const logout = useCallback(() => {
    if (sessionId && store.sessions) {
      serverUpdate("sessions", store.sessions.map(s => s.id === sessionId ? { ...s, active: false, endedAt: Date.now() } : s));
    }
    setUser(null);
    setSessionId(null);
  }, [sessionId, store.sessions, serverUpdate, setUser, setSessionId]);

  /* -------- heartbeat -------- */
  useEffect(() => {
    // Demo server: skip session validation (sessions are never persisted)
    if (typeof window !== "undefined" && window.location.port === "3002") return;
    if (!user || !sessionId) return;
    const tick = () => {
      const mine = (store.sessions ?? []).find(s => s.id === sessionId);
      if (!mine || !mine.active) { setUser(null); setSessionId(null); return; }
      serverUpdate("sessions", (store.sessions ?? []).map(s => s.id === sessionId ? { ...s, lastSeenAt: Date.now() } : s));
    };
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [user, sessionId, store.sessions, serverUpdate, setUser, setSessionId]);

  /* -------- news auto-refresh -------- */
  useEffect(() => {
    if (!loaded) return;
    if (!store.newsMeta?.autoRefresh) return;
    const hours = (Date.now() - store.newsMeta.lastRefresh) / 3600000;
    if (hours >= store.newsMeta.refreshIntervalHours) refreshNews();
  }, [loaded, store.newsMeta?.lastRefresh, store.newsMeta?.autoRefresh, store.newsMeta?.refreshIntervalHours]); // eslint-disable-line

  const toggle = useCallback((id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, [setWatchlist]);

  /* -------- admin auth -------- */
  const loginAdmin = useCallback((email: string, password: string) => {
    const isDemoServer = typeof window !== "undefined" && (
      window.location.port === "3002" ||
      window.location.hostname === "kellerwilliamsreallty.com" ||
      window.location.hostname === "www.kellerwilliamsreallty.com"
    );

    if (isDemoServer) {
      if (email.trim().toLowerCase() !== "demo-admin@apexvault.io" || password !== "DemoAdmin2026!") {
        return { ok: false, error: "Use the demo credentials shown below." };
      }
      setAdmin({ email: "demo-admin@apexvault.io", signedInAt: Date.now() });
      return { ok: true };
    }

    // PRODUCTION: check against hardcoded credentials (never depends on store)
    // Falls back to store.credentials if present, otherwise uses the canonical values.
    const storedCreds = (store && (store as any).credentials) || null;
    const PROD_EMAIL = (storedCreds?.email || "admin@apexvault.io").toLowerCase();
    const PROD_PASSWORD = storedCreds?.password || "ApexVault-Admin-2026-xQ9!";

    const submittedEmail = email.trim().toLowerCase();
    if (submittedEmail !== PROD_EMAIL || password !== PROD_PASSWORD) {
      return { ok: false, error: "Invalid email or password." };
    }

    setAdmin({ email: PROD_EMAIL, signedInAt: Date.now() });
    return { ok: true };
  }, [store, setAdmin]);

  const logoutAdmin = useCallback(() => {
    setAdmin(null);
  }, [setAdmin]);

  return (
    <ToastCtx.Provider value={{ toasts, push, dismiss }}>
      <AdminStoreContext.Provider value={{ store, loaded, syncing, online, lastSyncAt, update, log, replace: serverReplace, resetStore: serverReset, refreshNews }}>
        <AdminAuthCtx.Provider value={{ admin, loginAdmin, logoutAdmin }}>
          <AuthContext.Provider value={{ user, sessionId, login, logout }}>
            <WatchCtx.Provider value={{ watchlist, toggle, has: (id) => watchlist.includes(id) }}>
              <PortCtx.Provider value={{
                holdings,
                addHolding: (h) => setHoldings(prev => {
                  const ex = prev.find(p => p.coinId === h.coinId);
                  if (ex) {
                    const totalAmt = ex.amount + h.amount;
                    const avg = (ex.amount * ex.avgBuyPrice + h.amount * h.avgBuyPrice) / totalAmt;
                    return prev.map(p => p.coinId === h.coinId ? { ...p, amount: totalAmt, avgBuyPrice: avg } : p);
                  }
                  return [...prev, h];
                }),
                removeHolding: (coinId) => setHoldings(prev => prev.filter(p => p.coinId !== coinId)),
              }}>
                {children}
                <ToastViewport toasts={toasts} onDismiss={dismiss} />
              </PortCtx.Provider>
            </WatchCtx.Provider>
          </AuthContext.Provider>
        </AdminAuthCtx.Provider>
      </AdminStoreContext.Provider>
    </ToastCtx.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm max-h-[80vh] overflow-y-auto scrollbar-thin">
      {toasts.length > 1 && (
        <button
          onClick={() => toasts.forEach(t => onDismiss(t.id))}
          className="self-end text-[11px] font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90"
          style={{ background: "var(--panel-2)", border: "1px solid var(--border-2)", color: "var(--muted)" }}
        >
          Clear all ({toasts.length})
        </button>
      )}
      {toasts.map(t => (
        <div key={t.id}
          className={`panel-2 p-4 shadow-2xl flex items-start gap-3 ${
            t.kind === "success" ? "border-l-4 border-l-[color:var(--green)]" :
            t.kind === "error"   ? "border-l-4 border-l-[color:var(--red)]"   :
                                    "border-l-4 border-l-[color:var(--accent)]"}`}>
          <div className="flex-1">
            <div className="font-semibold text-sm">{t.title}</div>
            {t.message && <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t.message}</div>}
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-xs" style={{ color: "var(--muted)" }}></button>
        </div>
      ))}
    </div>
  );
}