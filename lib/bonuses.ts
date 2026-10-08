import { Store } from "./adminStore";

export interface BonusConfig {
  depositBonusPercent: number;
  depositBonusMinUsd: number;
  depositBonusMaxUsd: number;
  referralBonusType: "fixed" | "percent";
  referralBonusUsd: number;
  referralBonusPercent: number;
}

export const DEFAULT_BONUS_CONFIG: BonusConfig = {
  depositBonusPercent: 0,
  depositBonusMinUsd: 100,
  depositBonusMaxUsd: 500,
  referralBonusType: "fixed",
  referralBonusUsd: 25,
  referralBonusPercent: 5,
};

export function getBonusConfig(store: Store): BonusConfig {
  const raw = (store?.settings as any)?.bonuses;
  return { ...DEFAULT_BONUS_CONFIG, ...(raw ?? {}) };
}

export function computeDepositBonus(amountUsd: number, cfg: BonusConfig): number {
  if (!cfg.depositBonusPercent || cfg.depositBonusPercent <= 0) return 0;
  if (amountUsd < cfg.depositBonusMinUsd) return 0;
  const raw = (amountUsd * cfg.depositBonusPercent) / 100;
  return Math.min(raw, cfg.depositBonusMaxUsd);
}

export function computeReferralBonus(firstDepositUsd: number, cfg: BonusConfig): number {
  if (cfg.referralBonusType === "percent") {
    return (firstDepositUsd * (cfg.referralBonusPercent || 0)) / 100;
  }
  return cfg.referralBonusUsd || 0;
}

export function hasReferralBonusBeenPaid(store: Store, referredUserId: string): boolean {
  return (store.transactions ?? []).some(
    (t: any) => t.referredUserId === referredUserId && t.bonusKind === "referral"
  );
}

export function hasDepositBonusBeenPaid(store: Store, txId: string): boolean {
  return (store.transactions ?? []).some(
    (t: any) => t.sourceTxId === txId && t.bonusKind === "deposit"
  );
}