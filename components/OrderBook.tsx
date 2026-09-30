"use client";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/format";

export default function OrderBook({ price, symbol }: { price: number; symbol: string }) {
  const { bids, asks, spread, spreadPct } = useMemo(() => {
    const rows = 12;
    const tick = price * 0.0004;
    const seed = (s: number) => { const x = Math.sin(s * 999) * 10000; return x - Math.floor(x); };
    const b = Array.from({ length: rows }).map((_, i) => ({
      price: price - tick * (i + 1) - tick * seed(i) * 0.4,
      size: 0.4 + seed(i + 10) * 6.5,
      total: 0,
    }));
    const a = Array.from({ length: rows }).map((_, i) => ({
      price: price + tick * (i + 1) + tick * seed(i + 30) * 0.4,
      size: 0.4 + seed(i + 40) * 6.5,
      total: 0,
    })).reverse();
    let bt = 0; b.forEach(r => { bt += r.size; r.total = bt; });
    let at = 0; a.forEach(r => { at += r.size; r.total = at; });
    const max = Math.max(bt, at);
    const s = a[0].price - b[0].price;
    return { bids: b.map(r => ({ ...r, pct: r.total / max })), asks: a.map(r => ({ ...r, pct: r.total / max })), spread: s, spreadPct: (s / price) * 100 };
  }, [price]);

  return (
    <div className="panel flex flex-col" style={{ maxHeight: 560 }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold text-sm">Order Book</h3>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{symbol}/USDT</span>
      </div>
      <div className="px-4 py-2 grid grid-cols-3 text-xs font-medium border-b" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
        <span>Price (USDT)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (sell) */}
        <div className="flex-1 flex flex-col-reverse overflow-hidden">
          {asks.map((r, i) => (
            <Row key={i} price={r.price} size={r.size} total={r.total} pct={r.pct} kind="ask" />
          ))}
        </div>

        {/* Mid */}
        <div className="px-4 py-2.5 border-y flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}>
          <span className="mono text-lg font-bold" style={{ color: "var(--green)" }}>{formatCurrency(price)}</span>
          <div className="text-right">
            <div className="text-xs" style={{ color: "var(--muted)" }}>Spread</div>
            <div className="text-xs mono">{formatCurrency(spread, 4)}  {spreadPct.toFixed(3)}%</div>
          </div>
        </div>

        {/* Bids (buy) */}
        <div className="flex-1 overflow-hidden">
          {bids.map((r, i) => (
            <Row key={i} price={r.price} size={r.size} total={r.total} pct={r.pct} kind="bid" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ price, size, total, pct, kind }: { price: number; size: number; total: number; pct: number; kind: "ask" | "bid" }) {
  const color = kind === "ask" ? "var(--red)" : "var(--green)";
  return (
    <div className="relative grid grid-cols-3 px-4 py-1 text-xs mono hover:bg-white/5 transition">
      <div className={kind === "ask" ? "depth-ask" : "depth-bid"} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${pct * 100}%`, zIndex: 0 }} />
      <span className="relative z-10" style={{ color }}>{price.toFixed(4)}</span>
      <span className="relative z-10 text-right">{size.toFixed(4)}</span>
      <span className="relative z-10 text-right" style={{ color: "var(--muted)" }}>{total.toFixed(4)}</span>
    </div>
  );
}