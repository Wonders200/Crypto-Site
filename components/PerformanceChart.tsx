"use client";
import { useMemo } from "react";
import { generateEquityCurve } from "@/lib/analytics";

export default function PerformanceChart({ height = 260 }: { height?: number }) {
  const data = useMemo(() => generateEquityCurve(100, 90), []);
  const W = 800, H = height, pad = 20;
  const min = Math.min(...data.map(d => d.v)), max = Math.max(...data.map(d => d.v));
  const range = max - min || 1;
  const step = (W - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => `${pad + i * step},${H - pad - ((d.v - min) / range) * (H - pad * 2)}`).join(" ");
  const area = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  const positive = data[data.length - 1].v >= data[0].v;
  const stroke = positive ? "var(--green)" : "var(--red)";
  const fill = positive ? "rgba(0,209,140,0.12)" : "rgba(255,61,90,0.12)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={pad} x2={W - pad} y1={pad + ((H - pad * 2) / 4) * i} y2={pad + ((H - pad * 2) / 4) * i}
          stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
      ))}
      <polygon points={area} fill={fill} />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}