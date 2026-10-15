"use client";
import { useMemo } from "react";
import { useAdminStore } from "@/app/providers";

export interface PendingCounts {
  transactions: number;
  kyc: number;
  earnPositions: number;
  orders: number;
  total: number;
}

export function usePendingCounts(): PendingCounts {
  const { store } = useAdminStore();

  return useMemo(() => {
    const transactions = (store.transactions ?? []).filter(t => t.status === "pending").length;
    const kyc = (store.users ?? [])
      .filter(u => (u.kycStatus ?? "unverified") === "pending")
      .filter(u => !String(u.email ?? "").toLowerCase().endsWith("@apexvault.internal"))
      .length;
    const earnPositions = (store.earnPositions ?? []).filter(p => p.status === "pending").length;
    const orders = (store.orders ?? []).filter(o => o.status === "pending").length;
    return { transactions, kyc, earnPositions, orders, total: transactions + kyc + earnPositions + orders };
  }, [store.transactions, store.users, store.earnPositions, store.orders]);
}