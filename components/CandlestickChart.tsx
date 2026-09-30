"use client";
import { useMemo, useState } from "react";
import { generateCandles } from "@/lib/cryptoData";

export default function CandlestickChart({ symbol, price, height = 380 }: { symbol: string; price: number; height?: number }) {
  const [range, setRange] = useState<"1H" | "4H" | "1D" | "1W">("4H");
  const candles = useMemo(() => generateCandles(symbol, price, 96), [symbol, price]);

  const W = 900, H = height, padL = 8, padR = 64, padT = 12, padB = 24;
  const cW = W - padL - padR, cH = H - padT - padB;
  const highs = candles.map(c => c.h), lows = candles.map(c => c.l);
  const max = Math.max(...highs), min = Math.min(...lows), range2 = max - min || 1;
  const cw = cW / candles.length;
  const bodyW = cw * 0.65;
  const y = (v: number) => padT + cH - ((v - min) / range2) * cH;

  const ma20 = candles.map((_, i) => {
    const slice = candles.slice(Math.max(0, i - 19), i + 1);
    return slice.reduce((s, c) => s + c.c, 0) / slice.length;
  });

  const gridLines = 5;

  return (
    <div className="panel p-4">
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
                fill={bullish ? color : color} opacity={bullish ? 0.95 : 1} />
            </g>
          );
        })}

        <polyline
          points={ma20.map((v, i) => `${padL + i * cw + cw / 2},${y(v)}`).join(" ")}
          fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8"
        />
      </svg>
    </div>
  );
}