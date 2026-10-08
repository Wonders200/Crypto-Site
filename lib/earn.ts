import { AdminEarnPosition } from "./adminStore";

export function computeAccrued(pos: AdminEarnPosition, now = Date.now()): number {
  if (pos.status !== "active") return pos.accrued || 0;
  const dailyRate = (pos.amountUsd * pos.apy) / 100 / 365;
  const elapsedMs = Math.max(0, now - pos.startedAt);
  return dailyRate * (elapsedMs / 86400000);
}

export function dailyRate(pos: AdminEarnPosition): number {
  return (pos.amountUsd * pos.apy) / 100 / 365;
}

export function totalValue(pos: AdminEarnPosition, now = Date.now()): number {
  return pos.amountUsd + computeAccrued(pos, now);
}