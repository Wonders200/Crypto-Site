"use client";
import { useEffect, useState } from "react";
import { useAdminStore } from "@/app/providers";
import { AdminCoin } from "@/lib/adminStore";

export interface LiveCoin extends AdminCoin { sparkline: number[]; }

function genSparkline(base: number, trendPct: number, points = 32, key = "s"): number[] {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rng = () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const arr: number[] = [];
  let v = base * (1 - trendPct / 100);
  const drift = (base * trendPct / 100) / points;
  for (let i = 0; i < points; i++) { v = v * (1 + (rng() - 0.5) * 0.014) + drift; arr.push(v); }
  arr[arr.length - 1] = base;
  return arr;
}

function toLive(c: AdminCoin): LiveCoin {
  return { ...c, sparkline: genSparkline(c.price, c.change7d, 32, c.id) };
}

export function useLivePrices(intervalMs = 3000): LiveCoin[] {
  const { store } = useAdminStore();
  const enabled = store.coins.filter(c => c.enabled);
  const [coins, setCoins] = useState<LiveCoin[]>(() => enabled.map(toLive));

  useEffect(() => {
    setCoins(enabled.map(toLive));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(enabled.map(c => c.id + c.price))]);

  useEffect(() => {
    const t = setInterval(() => {
      setCoins(prev => prev.map(c => {
        const delta = c.price * 0.003 * (Math.random() * 2 - 1);
        const np = Math.max(c.price + delta, 0.0001);
        return { ...c, price: np, change24h: c.change24h + (delta / c.price) * 100, sparkline: [...c.sparkline.slice(1), np] };
      }));
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return coins;
}