"use client";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLivePrices } from "@/hooks/useLivePrices";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function TickerTape() {
  const pathname = usePathname();
  const coins = useLivePrices(4000);

  // Hide ticker on /admin/* routes
  if (pathname?.startsWith("/admin")) return null;

  // Only show the 20 most valuable assets in the ticker  keeps DOM light
  const top = useMemo(
    () => [...coins].sort((a, b) => b.marketCap - a.marketCap).slice(0, 20),
    [coins]
  );
  const items = [...top, ...top]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-b" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="ticker-track whitespace-nowrap py-2">
        {items.map((c, i) => {
          const pos = c.change24h >= 0;
          return (
            <Link key={`${c.id}-${i}`} href={`/trade/${c.symbol.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-5 text-xs border-r"
              style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>{c.symbol}</span>
              <span className="mono" style={{ color: "var(--muted)" }}>{formatCurrency(c.price)}</span>
              <span className="mono" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                {formatPercent(c.change24h)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}