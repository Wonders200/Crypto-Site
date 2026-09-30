"use client";
import CoinIcon from "@/components/CoinIcon";
import Link from "next/link";
import { Coin } from "@/lib/cryptoData";
import { Holding, computeHoldingValue } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/format";
import LiveDate from "@/components/LiveDate";

export default function PortfolioTable({ portfolio, coins }: { portfolio: Holding[]; coins: Coin[] }) {
  if (portfolio.length === 0) {
    return (
      <div className="panel p-10 text-center" style={{ color: "var(--muted)" }}>No holdings yet.</div>
    );
  }
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              <th className="p-4 text-left">Asset</th>
              <th className="p-4 text-right">Quantity</th>
              <th className="p-4 text-right">Avg cost</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Value</th>
              <th className="p-4 text-right">P/L</th>
              <th className="p-4 text-right">Return</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(h => {
              const r = computeHoldingValue(h, coins);
              if (!r.coin) return null;
              const pos = r.pl >= 0;
              return (
                <tr key={h.coinId} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "var(--border)" }}>
                  <td className="p-4">
                    <Link href={`/trade/${r.coin.symbol.toLowerCase()}`} className="flex items-center gap-3">
                      <CoinIcon symbol={r.coin.symbol} color={r.coin.color} size={32} />
                      <div>
                        <div className="font-semibold">{r.coin.name}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{r.coin.symbol}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 text-right mono">{h.amount}</td>
                  <td className="p-4 text-right mono" style={{ color: "var(--muted)" }}>{formatCurrency(h.avgBuyPrice)}</td>
                  <td className="p-4 text-right mono">{formatCurrency(r.coin.price)}</td>
                  <td className="p-4 text-right mono font-semibold">{formatCurrency(r.value)}</td>
                  <td className="p-4 text-right mono" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                    {pos ? "+" : ""}{formatCurrency(r.pl)}
                  </td>
                  <td className="p-4 text-right mono" style={{ color: pos ? "var(--green)" : "var(--red)" }}>{formatPercent(r.plPct)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/trade/${r.coin.symbol.toLowerCase()}`} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>Trade</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}