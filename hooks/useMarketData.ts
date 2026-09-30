"use client";
import { useEffect, useState } from "react";
import { INITIAL_COINS, AdminCoin } from "@/lib/adminStore";

const KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ?? "";

export function hasLiveMarket(): boolean {
  return Boolean(KEY);
}

/**
 * If CoinGecko API key is set, fetches live prices every 30s.
 * Otherwise returns the store's simulated coins.
 */
export function useMarketData(): { coins: AdminCoin[]; live: boolean } {
  const [coins, setCoins] = useState<AdminCoin[]>(INITIAL_COINS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1",
          { headers: KEY ? { "x-cg-demo-api-key": KEY } : {} }
        );
        if (!res.ok) return;
        const list = await res.json();
        if (cancelled) return;
        setCoins(prev => prev.map(c => {
          const match = list.find((x: any) => (x.symbol ?? "").toUpperCase() === c.symbol.toUpperCase());
          if (!match) return c;
          return {
            ...c,
            price: match.current_price ?? c.price,
            change24h: match.price_change_percentage_24h ?? c.change24h,
            change7d: match.price_change_percentage_7d_in_currency ?? c.change7d,
            marketCap: match.market_cap ?? c.marketCap,
            volume24h: match.total_volume ?? c.volume24h,
          };
        }));
        setLive(true);
      } catch {}
    };

    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return { coins, live };
}