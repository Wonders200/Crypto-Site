'use client';
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Store, AuditEntry, uid, AdminUser, AdminSession, DEFAULT_DEMO_USER } from '@/lib/adminStore';
import {
  loadDemoStore, saveDemoStore, resetDemoStore,
  loadDemoUser, saveDemoUser,
  DEMO_ADMIN_CREDENTIALS, DEMO_CUSTOMER_CREDENTIALS,
} from '@/lib/demoStore';

type DemoUser = { email: string; name: string; tier: 'Standard' | 'Pro' | 'Institutional'; password?: string } | null;
type DemoAdmin = { email: string } | null;

type DemoStoreCtx = {
  store: Store;
  update: (key: keyof Store, value: any) => void;
  log: (action: string, target: string, details?: string) => void;
  resetStore: () => void;
};

const DemoStoreContext = createContext<DemoStoreCtx | null>(null);
const DemoAuthContext = createContext<{ user: DemoUser; login: (u: DemoUser) => void; logout: () => void; sessionId: string | null } | null>(null);
const DemoAdminAuthContext = createContext<{ admin: DemoAdmin; loginAdmin: (e: string, p: string) => { ok: boolean; error?: string }; logoutAdmin: () => void } | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadDemoStore());
  const [user, setUser] = useState<DemoUser>(() => loadDemoUser());
  const [admin, setAdmin] = useState<DemoAdmin>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const update = useCallback((key: keyof Store, value: any) => {
    setStore(prev => {
      const next = { ...prev, [key]: value };
      saveDemoStore(next);
      return next;
    });
  }, []);

  const log = useCallback((action: string, target: string, details?: string) => {
    setStore(prev => {
      const entry: AuditEntry = { id: uid('a'), action, target, details, at: Date.now(), actor: admin?.email ?? user?.email ?? 'demo' };
      const next = { ...prev, auditLog: [entry, ...(prev.auditLog ?? [])].slice(0, 100) };
      saveDemoStore(next);
      return next;
    });
  }, [admin, user]);

  const resetStore = useCallback(() => {
    resetDemoStore();
    const fresh = loadDemoStore();
    setStore(fresh);
    setUser(null);
    setAdmin(null);
    setSessionId(null);
  }, []);

  const login = useCallback((u: DemoUser) => {
    if (!u) { setUser(null); setSessionId(null); saveDemoUser(null); return; }
    setUser(u);
    setSessionId('demo-session-' + Math.random().toString(36).slice(2, 10));
    saveDemoUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionId(null);
    saveDemoUser(null);
  }, []);

  const loginAdmin = useCallback((email: string, password: string) => {
    if (email.trim().toLowerCase() !== DEMO_ADMIN_CREDENTIALS.email.toLowerCase() || password !== DEMO_ADMIN_CREDENTIALS.password) {
      return { ok: false, error: 'Use the demo credentials shown on the /demo page.' };
    }
    setAdmin({ email: DEMO_ADMIN_CREDENTIALS.email });
    return { ok: true };
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdmin(null);
  }, []);

  const storeValue = useMemo(() => ({ store, update, log, resetStore }), [store, update, log, resetStore]);
  const authValue = useMemo(() => ({ user, login, logout, sessionId }), [user, login, logout, sessionId]);
  const adminValue = useMemo(() => ({ admin, loginAdmin, logoutAdmin }), [admin, loginAdmin, logoutAdmin]);

  return (
    <DemoStoreContext.Provider value={storeValue}>
      <DemoAuthContext.Provider value={authValue}>
        <DemoAdminAuthContext.Provider value={adminValue}>
          {children}
        </DemoAdminAuthContext.Provider>
      </DemoAuthContext.Provider>
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error('useDemoStore must be used inside DemoProvider');
  return ctx;
}
export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth must be used inside DemoProvider');
  return ctx;
}
export function useDemoAdminAuth() {
  const ctx = useContext(DemoAdminAuthContext);
  if (!ctx) throw new Error('useDemoAdminAuth must be used inside DemoProvider');
  return ctx;
}
