import { DEFAULT_STORE, Store } from './adminStore';

const DEMO_KEY = 'demo.cs.store';
const DEMO_USER_KEY = 'demo.cs.user';
const DEMO_ADMIN_KEY = 'demo.cs.admin';

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'demo-admin@apexvault.io',
  password: 'DemoAdmin2026!',
};

export const DEMO_CUSTOMER_CREDENTIALS = {
  email: 'demo@apexvault.io',
  password: 'DemoCustomer2026!',
  name: 'Alexa S Adamz',
  tier: 'Pro' as const,
};

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

/**
 * Build a fully isolated demo store from the DEFAULT_STORE.
 * Overrides users, credentials, and store data so nothing real leaks.
 */
function buildDemoStore(): Store {
  const demoUsers = [
    { id: 'demo-u1', name: 'Alexa S Adamz', email: 'demo@apexvault.io', tier: 'Pro' as const, status: 'active' as const, createdAt: Date.now() - 86400000 * 90, kycStatus: 'verified' as const, password: DEMO_CUSTOMER_CREDENTIALS.password },
    { id: 'demo-u2', name: 'Marcus Chen', email: 'marcus@demo.apexvault.io', tier: 'Standard' as const, status: 'active' as const, createdAt: Date.now() - 86400000 * 30, kycStatus: 'pending' as const },
    { id: 'demo-u3', name: 'Priya Raman', email: 'priya@demo.apexvault.io', tier: 'Institutional' as const, status: 'active' as const, createdAt: Date.now() - 86400000 * 180, kycStatus: 'verified' as const },
    { id: 'demo-u4', name: 'James Okonkwo', email: 'james@demo.apexvault.io', tier: 'Standard' as const, status: 'suspended' as const, createdAt: Date.now() - 86400000 * 15, kycStatus: 'rejected' as const },
  ];

  const base = deepClone(DEFAULT_STORE);
  return {
    ...base,
    // Never inherit real admin credentials in demo
    adminCredentials: {
      email: "hidden@apexvault.io",
      password: "hidden",
    },
    credentials: {
      email: "hidden@apexvault.io",
      password: "hidden",
    },
    users: demoUsers,
    adminCredentials: {
      email: DEMO_ADMIN_CREDENTIALS.email,
      password: DEMO_ADMIN_CREDENTIALS.password,
    },
    demoUser: {
      email: DEMO_CUSTOMER_CREDENTIALS.email,
      password: DEMO_CUSTOMER_CREDENTIALS.password,
      name: DEMO_CUSTOMER_CREDENTIALS.name,
      tier: DEMO_CUSTOMER_CREDENTIALS.tier,
    },
    balances: [
      { userId: 'demo-u1', usd: 48287.29, locked: 0, updatedAt: Date.now() },
      { userId: 'demo-u2', usd: 15420.50, locked: 2500, updatedAt: Date.now() - 3600000 },
      { userId: 'demo-u3', usd: 892340.00, locked: 45000, updatedAt: Date.now() - 7200000 },
      { userId: 'demo-u4', usd: 0, locked: 0, updatedAt: Date.now() - 86400000 },
    ],
    transactions: [
      { id: 'demo-t1', userId: 'demo-u1', type: 'deposit' as any, amount: 1000, currency: 'USD', status: 'completed' as any, description: 'Bitcoin deposit - DEMO01', createdAt: Date.now() - 3600000, reference: 'DEMO-DEP-01', network: 'Bitcoin', asset: 'BTC' },
      { id: 'demo-t2', userId: 'demo-u1', type: 'deposit' as any, amount: 5000, currency: 'USD', status: 'pending' as any, description: 'USDT deposit - DEMO02', createdAt: Date.now() - 7200000, reference: 'DEMO-DEP-02', network: 'TRC-20', asset: 'USDT' },
      { id: 'demo-t3', userId: 'demo-u1', type: 'withdrawal' as any, amount: -2500, currency: 'USD', status: 'completed' as any, description: 'Withdrawal to external wallet', createdAt: Date.now() - 86400000, reference: 'DEMO-WTH-01' },
      { id: 'demo-t4', userId: 'demo-u2', type: 'deposit' as any, amount: 25000, currency: 'USD', status: 'completed' as any, description: 'Ethereum deposit', createdAt: Date.now() - 172800000, reference: 'DEMO-DEP-03', network: 'ERC-20', asset: 'ETH' },
      { id: 'demo-t5', userId: 'demo-u3', type: 'deposit' as any, amount: 500000, currency: 'USD', status: 'completed' as any, description: 'Institutional deposit', createdAt: Date.now() - 259200000, reference: 'DEMO-DEP-04', network: 'Bitcoin', asset: 'BTC' },
    ],
    earnPositions: [
      { id: 'demo-ep1', userId: 'demo-u1', productId: 'demo-p1', asset: 'USDC', amountUsd: 10000, apy: 5.2, startedAt: Date.now() - 86400000 * 30, status: 'active' as const, accrued: 42.50, lastAccrualAt: Date.now() - 3600000 },
      { id: 'demo-ep2', userId: 'demo-u1', productId: 'demo-p2', asset: 'ETH', amountUsd: 5000, apy: 5.4, startedAt: Date.now() - 86400000 * 60, status: 'active' as const, accrued: 44.55, lastAccrualAt: Date.now() - 3600000 },
    ],
  };
}

export function loadDemoStore(): Store {
  if (typeof window === 'undefined') return buildDemoStore();
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return buildDemoStore();
}

export function saveDemoStore(store: Store) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(store)); } catch {}
}

export function resetDemoStore() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_USER_KEY);
  localStorage.removeItem(DEMO_ADMIN_KEY);
}

export function loadDemoUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveDemoUser(user: any) {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_USER_KEY);
  } catch {}
}

export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('cs.demoMode');
}

export function isDemoRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/demo');
}
