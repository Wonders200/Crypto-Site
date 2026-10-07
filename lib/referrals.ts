import { Store } from './adminStore';

/** Generate a short, unique referral code from name + random */
export function makeReferralCode(name: string): string {
  const base = (name || "user").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "USER";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return base + rand;
}

/** Find a user by referral code */
export function findByReferralCode(store: Store, code: string) {
  if (!code) return null;
  const upper = code.toUpperCase();
  return (store.users ?? []).find((u: any) => u.referralCode?.toUpperCase() === upper) ?? null;
}

/** Count referrals for a user (direct only) */
export function getReferralStats(store: Store, userId: string) {
  const direct = (store.users ?? []).filter((u: any) => u.referredBy === userId);
  const totalEarned = direct.reduce((sum: number, u: any) => sum + (u.referralBonusUsd ?? 0), 0);
  return {
    count: direct.length,
    direct,
    totalEarned,
  };
}
