"use client";

export default function AllocationDonut({ data, total }: { data: { symbol: string; name: string; color: string; value: number; weight: number }[]; total: number }) {
  const size = 220, cx = size / 2, cy = size / 2, r = 80, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {data.length === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        ) : (
          data.map((d, i) => {
            const dash = d.weight * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={d.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`} />
            );
            offset += dash;
            return el;
          })
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--muted)">TOTAL</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)" fontFamily="monospace">
          ${(total / 1000).toFixed(1)}k
        </text>
      </svg>
      <div className="flex-1 w-full space-y-2">
        {data.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>No holdings yet.</p>}
        {data.map(d => (
          <div key={d.symbol} className="flex items-center gap-3 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="font-semibold w-12">{d.symbol}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--panel-2)" }}>
              <div className="h-full rounded-full" style={{ width: `${d.weight * 100}%`, background: d.color }} />
            </div>
            <span className="mono text-xs w-14 text-right">{(d.weight * 100).toFixed(1)}%</span>
            <span className="mono text-xs w-20 text-right">${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}