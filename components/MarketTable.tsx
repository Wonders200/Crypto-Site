"use client";
import CoinIcon from "@/components/CoinIcon";
import Link from "next/link";
import { Star } from "lucide-react";
import { Coin } from "@/lib/cryptoData";
import { formatCurrency, formatPercent, formatCompact } from "@/lib/format";
import Sparkline from "./Sparkline";
import { useWatchlist } from "@/app/providers";

export default function MarketTable({ coins }: { coins: Coin[] }) {
  const { has, toggle } = useWatchlist();
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[920px]">
          <thead>
            <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              <th className="p-3 w-8"></th>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Asset</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">24h</th>
              <th className="p-3 text-right">7d</th>
              <th className="p-3 text-right">Market Cap</th>
              <th className="p-3 text-right">Volume (24h)</th>
              <th className="p-3 text-right">7d Chart</th>
              <th className="p-3 text-right">Risk</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coins.map((c, i) => {
              const pos24 = c.change24h >= 0, pos7 = c.change7d >= 0;
              const starred = has(c.id);
              return (
                <tr key={c.id} className="border-b transition hover:bg-white/[0.02]" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3">
                    <button onClick={() => toggle(c.id)} aria-label="Watch" className="hover:scale-110 transition">
                      <Star size={14} fill={starred ? "var(--amber)" : "none"} stroke={starred ? "var(--amber)" : "var(--muted-2)"} />
                    </button>
                  </td>
                  <td className="p-3 mono text-xs" style={{ color: "var(--muted)" }}>{i + 1}</td>
                  <td className="p-3">
                    <Link href={`/trade/${c.symbol.toLowerCase()}`} className="flex items-center gap-3 hover:opacity-90">
                      <CoinIcon symbol={c.symbol} color={c.color} size={32} />
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{c.symbol}  {c.category}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-right mono">{formatCurrency(c.price)}</td>
                  <td className="p-3 text-right mono" style={{ color: pos24 ? "var(--green)" : "var(--red)" }}>{formatPercent(c.change24h)}</td>
                  <td className="p-3 text-right mono" style={{ color: pos7 ? "var(--green)" : "var(--red)" }}>{formatPercent(c.change7d)}</td>
                  <td className="p-3 text-right mono" style={{ color: "var(--muted)" }}>{formatCompact(c.marketCap)}</td>
                  <td className="p-3 text-right mono" style={{ color: "var(--muted)" }}>{formatCompact(c.volume24h)}</td>
                  <td className="p-3 flex justify-end">
                    <Sparkline data={c.sparkline} positive={pos7} width={100} height={30} />
                  </td>
                  <td className="p-3 text-right">
                    <span className={`pill ${c.risk <= 2 ? "pill-green" : c.risk === 3 ? "pill-blue" : c.risk === 4 ? "pill-amber" : "pill-red"}`}>
                      {c.risk <= 2 ? "Low" : c.risk === 3 ? "Med" : c.risk === 4 ? "High" : "V.High"}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/trade/${c.symbol.toLowerCase()}`}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                      Trade
                    </Link>
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