"use client";
import CoinIcon from "@/components/CoinIcon";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLivePrices } from "@/hooks/useLivePrices";
import MarketTable from "@/components/MarketTable";
import EmptyState from "@/components/EmptyState";

const CATEGORIES = ["All", "Layer 1", "Layer 2", "DeFi", "Stablecoin", "Infra", "Meme", "Exchange"] as const;

function MarketsInner() {
  const params = useSearchParams();
  const coins = useLivePrices();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return coins.filter(c =>
      (cat === "All" || c.category === cat) &&
      (!term || c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term))
    );
  }, [coins, q, cat]);

  const gainers = [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, 3);
  const losers  = [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, 3);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Markets</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Live pricing across {coins.length} assets. Updates every 3 seconds.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <MoversCard title="Top Gainers (24h)" rows={gainers} kind="up" />
        <MoversCard title="Top Losers (24h)"  rows={losers}  kind="down" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or symbol"
          className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: "var(--panel)", border: "1px solid var(--border)", color: "var(--text)" }} />
        <div className="flex gap-1 overflow-x-auto scrollbar-thin p-1 rounded-lg" style={{ background: "var(--panel)" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition"
              style={{ background: cat === c ? "var(--panel-2)" : "transparent", color: cat === c ? "var(--text)" : "var(--muted)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No assets match" message="Try a different search term or category." />
      ) : (
        <MarketTable coins={filtered} />
      )}
    </div>
  );
}

export default function MarketsPage() {
  return <Suspense fallback={<div className="max-w-[1400px] mx-auto px-6 py-10" style={{ color: "var(--muted)" }}>Loading</div>}><MarketsInner /></Suspense>;
}

function MoversCard({ title, rows, kind }: { title: string; rows: { symbol: string; name: string; price: number; change24h: number; color: string }[]; kind: "up" | "down" }) {
  return (
    <div className="panel p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.symbol} className="flex items-center gap-3">
            <CoinIcon symbol={r.symbol} color={r.color} size={32} />
            <div className="flex-1"><div className="text-sm font-semibold">{r.name}</div><div className="text-xs" style={{ color: "var(--muted)" }}>{r.symbol}</div></div>
            <div className="text-right">
              <div className="mono text-sm">${r.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div className="mono text-xs" style={{ color: kind === "up" ? "var(--green)" : "var(--red)" }}>{r.change24h >= 0 ? "+" : ""}{r.change24h.toFixed(2)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}