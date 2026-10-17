"use client";
import { useMemo, useState, useEffect } from "react";
import { generateCandles } from "@/lib/cryptoData";

const RANGE_CONFIG: Record<"1H" | "4H" | "1D" | "1W", { count: number; interval: string; binanceInterval: string }> = {
  "1H": { count: 96, interval: "60 * 60 * 1000", binanceInterval: "1h" },
  "4H": { count: 90, interval: "4 * 60 * 60 * 1000", binanceInterval: "4h" },
  "1D": { count: 90, interval: "24 * 60 * 60 * 1000", binanceInterval: "1d" },
  "1W": { count: 52, interval: "7 * 24 * 60 * 60 * 1000", binanceInterval: "1w" },
};

function getBinanceSymbol(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s === "USDT" || s === "USDC" || s === "DAI") return "USDCUSDT"; // fallback for stablecoins
  return s + "USDT";
}

export default function CandlestickChart({ symbol, price, height = 380 }: { symbol: string; price: number; height?: number }) {
  const [range, setRange] = useState<"1H" | "4H" | "1D" | "1W">("4H");
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const config = RANGE_CONFIG[range];
        const binanceSym = getBinanceSymbol(symbol);
        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSym}&interval=${config.binanceInterval}&limit=${config.count}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("API failed");
        
        const data = await res.json();
        if (cancelled) return;

        // Binance format: [Open time, Open, High, Low, Close, Volume, ...]
        const formatted = data.map((d: any) => ({
          t: d[0],       // timestamp
          o: parseFloat(d[1]), // open
          h: parseFloat(d[2]), // high
          l: parseFloat(d[3]), // low
          c: parseFloat(d[4]), // close
          v: parseFloat(d[5]), // volume
        }));
        
        setCandles(formatted);
      } catch (err) {
        if (cancelled) return;
        // Fallback to synthetic data if Binance fails/blocked
        const config = RANGE_CONFIG[range];
        const ms = eval(config.interval);
        setCandles(generateCandles(symbol, price, config.count, ms));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [symbol, price, range]);

  const W = 900, H = height, padL = 8, padR = 64, padT = 12, padB = 24;
  const cW = W - padL - padR, cH = H - padT - padB;
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const max = Math.max(...highs) || 1;
  const min = Math.min(...lows) || 1;
  const range2 = max - min || 1;
  const cw = cW / (candles.length || 1);
  const bodyW = cw * 0.65;
  const y = (v: number) => padT + cH - ((v - min) / range2) * cH;

  const ma20 = candles.map((_, i) => {
    const slice = candles.slice(Math.max(0, i - 19), i + 1);
    return slice.reduce((s, c) => s + c.c, 0) / slice.length;
  });

  const gridLines = 5;

  return (
    <div className="panel p-4 relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg)]/50 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {(["1H", "4H", "1D", "1W"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition"
              style={{
                background: range === r ? "var(--panel-2)" : "transparent",
                color: range === r ? "var(--text)" : "var(--muted)",
                border: `1px solid ${range === r ? "var(--border-2)" : "transparent"}`,
              }}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: "var(--green)" }} />Bullish</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: "var(--red)" }} />Bearish</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: "var(--accent)" }} />MA(20)</span>
        </div>
      </div>
      
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const yPos = padT + (cH / gridLines) * i;
          const val = max - (range2 / gridLines) * i;
          return (
            <g key={i}>
              <line x1={padL} x2={padL + cW} y1={yPos} y2={yPos} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
              <text x={padL + cW + 8} y={yPos + 4} fontSize="10" fill="var(--muted)" fontFamily="monospace">
                ${val.toLocaleString(undefined, { maximumFractionDigits: val < 10 ? 4 : 0 })}
              </text>
            </g>
          );
        })}

        {candles.map((c, i) => {
          const x = padL + i * cw + cw / 2;
          const bullish = c.c >= c.o;
          const color = bullish ? "var(--green)" : "var(--red)";
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" />
              <rect x={x - bodyW / 2} y={y(Math.max(c.o, c.c))} width={bodyW}
                height={Math.max(1, Math.abs(y(c.o) - y(c.c)))}
                fill={color} opacity={bullish ? 0.95 : 1} />
            </g>
          );
        })}

        {ma20.length > 0 && (
          <polyline
            points={ma20.map((v, i) => `${padL + i * cw + cw / 2},${y(v)}`).join(" ")}
            fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
}
