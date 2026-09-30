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
    const kyc = (store.kycSubmissions ?? []).filter(s => s.status === "pending").length
      + (store.users ?? []).filter(u => u.kycStatus === "pending" && !(store.kycSubmissions ?? []).some(s => s.userId === u.id)).length;
    const earnPositions = (store.earnPositions ?? []).filter(p => p.status === "pending").length;
    const orders = (store.orders ?? []).filter(o => o.status === "pending").length;
    return { transactions, kyc, earnPositions, orders, total: transactions + kyc + earnPositions + orders };
  }, [store.transactions, store.kycSubmissions, store.users, store.earnPositions, store.orders]);
}