"use client";
import { useMemo, useState } from "react";
import { useAuth, useAdminStore } from "@/app/providers";
import { formatCurrency } from "@/lib/format";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import LiveDate from "@/components/LiveDate";
import StatementDownload from "@/components/StatementDownload";
import { ArrowDownToLine, ArrowUpFromLine, Receipt, X, CheckCircle2, Clock, XCircle, Hash, ChevronRight, TradeRow } from "lucide-react";
import Link from "next/link";

interface Props {
  symbol?: string;
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

interface TradeRow {
  id: string;
  side: "buy" | "sell";
  asset: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  fee: number;
  orderType: string;
  status: string;
  reference: string;
  createdAt: number;
}

export default function TradeHistory({ symbol, limit = 10, showHeader = true, compact = false }: Props) {
  const { user } = useAuth();
  const { store } = useAdminStore();
  const [viewing, setViewing] = useState<TradeRow | null>(null);

  const demoEmail = store.demoUser?.email ?? "demo@cryptosite.io";
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase())
    ?? store.users[0];

  const trades = useMemo<TradeRow[]>(() => {
    return store.transactions
      .filter(t => t.type === "trade")
      .filter(t => {
        if (t.userId === matchedUser?.id) return true;
        if (t.userId === "demo-user" && matchedUser) return true;
        return false;
      })
      .filter(t => !symbol || (t as any).asset?.toUpperCase() === symbol.toUpperCase())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(t => {
        const anyT = t as any;
        const qty = anyT.quantity ?? Math.abs(t.amount / (anyT.pricePerUnit ?? 1));
        return {
          id: t.id,
          side: anyT.side ?? (t.amount < 0 ? "buy" : "sell"),
          asset: anyT.asset ?? "",
          quantity: qty,
          pricePerUnit: anyT.pricePerUnit ?? 0,
          total: Math.abs(t.amount),
          fee: anyT.fee ?? 0,
          orderType: anyT.orderType ?? "market",
          status: t.status,
          reference: anyT.reference ?? t.id,
          createdAt: t.createdAt,
        };
      });
  }, [store.transactions, matchedUser?.id, symbol, limit]);

  /* CSV/PDF export rows */
  const statementRows = useMemo(() => trades.map(t => ({
    Date: new Date(t.createdAt).toISOString(),
    Side: t.side.toUpperCase(),
    Asset: t.asset,
    Amount: t.quantity,
    "Price (USD)": t.pricePerUnit,
    "Total (USD)": t.total,
    "Fee (USD)": t.fee,
    "Order Type": t.orderType.toUpperCase(),
    Status: t.status,
    Reference: t.reference,
  })), [trades]);

  if (trades.length === 0) {
    return (
      <div className="panel">
        {showHeader && (
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm">Trade History</h3>
            {symbol && <span className="text-xs mono" style={{ color: "var(--muted)" }}>{symbol}/USDT</span>}
          </div>
        )}
        <div className="py-12 text-center">
          <Receipt size={22} style={{ color: "var(--muted-2)", margin: "0 auto" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            No trades yet  your buy and sell orders will show up here.
          </p>
          {!symbol && (
            <Link href="/markets" className="btn btn-primary inline-flex mt-4 text-xs">
              Browse markets
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="panel overflow-hidden">
        {showHeader && (
          <div className="px-5 py-3.5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Trade History</h3>
              <span className="pill pill-gray">{trades.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {symbol && <span className="text-xs mono hidden sm:block" style={{ color: "var(--muted)" }}>{symbol}/USDT</span>}
              <StatementDownload
                title={symbol ? `${symbol} Trade History` : "Trade History"}
                rows={statementRows}
                filename={symbol ? `trades-${symbol.toLowerCase()}` : "trades"}
                ownerName={matchedUser?.name}
                ownerEmail={matchedUser?.email}
              />
            </div>
          </div>
        )}

        {!compact && (
          <div className="px-5 py-2 grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider font-medium border-b"
            style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
            <div className="col-span-2">Side</div>
            <div className="col-span-2">Asset</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Time</div>
          </div>
        )}

        <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
          {trades.map(t => {
            const isBuy = t.side === "buy";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setViewing(t)}
                className={`w-full text-left border-b hover:bg-white/[0.04] transition ${compact ? "px-5 py-3 flex items-center gap-3" : "px-5 py-3 grid grid-cols-12 gap-3 items-center"}`}
                style={{ borderColor: "var(--border)" }}
              >
                {compact ? (
                  <>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isBuy ? "var(--green-dim)" : "var(--red-dim)", color: isBuy ? "var(--green)" : "var(--red)" }}>
                      {isBuy ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{t.asset}</span>
                        <span className="pill" style={{
                          background: isBuy ? "var(--green-dim)" : "var(--red-dim)",
                          color: isBuy ? "var(--green)" : "var(--red)",
                          fontSize: 10,
                        }}>{isBuy ? "BUY" : "SELL"}</span>
                      </div>
                      <div className="text-[11px] mono truncate" style={{ color: "var(--muted)" }}>
                        {t.quantity.toFixed(6)} @ {formatCurrency(t.pricePerUnit)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="mono text-sm font-semibold" style={{ color: isBuy ? "var(--red)" : "var(--green)" }}>
                        {isBuy ? "" : "+"}{formatCurrency(t.total)}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                        <LiveTimeAgo ts={t.createdAt} />
                      </div>
                    </div>
                    <ChevronRight size={13} style={{ color: "var(--muted-2)" }} />
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      <span className="pill" style={{
                        background: isBuy ? "var(--green-dim)" : "var(--red-dim)",
                        color: isBuy ? "var(--green)" : "var(--red)",
                        fontSize: 10,
                      }}>
                        {isBuy ? <ArrowDownToLine size={10} /> : <ArrowUpFromLine size={10} />}
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="font-semibold text-sm">{t.asset}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{t.orderType}</div>
                    </div>
                    <div className="col-span-2 text-right mono text-sm">{t.quantity.toFixed(6)}</div>
                    <div className="col-span-2 text-right mono text-sm">{formatCurrency(t.pricePerUnit)}</div>
                    <div className="col-span-2 text-right mono text-sm font-semibold" style={{ color: isBuy ? "var(--text)" : "var(--green)" }}>
                      {isBuy ? "" : "+"}{formatCurrency(t.total)}
                    </div>
                    <div className="col-span-2 text-right text-[11px]" style={{ color: "var(--muted)" }}>
                      <LiveTimeAgo ts={t.createdAt} />
                      <div className="mono text-[10px]" style={{ color: "var(--muted-2)" }}>{t.reference.slice(0, 12)}</div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------- Trade detail modal -------- */}
      {viewing && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)" }} onClick={() => setViewing(null)}>
          <div className="panel w-full max-w-lg pop-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: viewing.side === "buy" ? "var(--green-dim)" : "var(--red-dim)",
                    color: viewing.side === "buy" ? "var(--green)" : "var(--red)",
                  }}>
                  {viewing.side === "buy" ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}
                </div>
                <div>
                  <div className="font-semibold">
                    {viewing.side === "buy" ? "Bought" : "Sold"} {viewing.quantity.toFixed(6)} {viewing.asset}
                  </div>
                  <div className="text-xs mono" style={{ color: "var(--muted)" }}>{viewing.reference}</div>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded hover:bg-white/5"><X size={16} /></button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {viewing.status === "completed"
                  ? <><CheckCircle2 size={14} style={{ color: "var(--green)" }} /><span className="text-sm" style={{ color: "var(--green)" }}>Completed</span></>
                  : viewing.status === "pending"
                  ? <><Clock size={14} style={{ color: "var(--amber)" }} /><span className="text-sm" style={{ color: "var(--amber)" }}>Pending</span></>
                  : <><XCircle size={14} style={{ color: "var(--red)" }} /><span className="text-sm" style={{ color: "var(--red)" }}>Failed</span></>}
              </div>

              {/* Amount hero */}
              <div className="rounded-xl p-4 text-center"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Total {viewing.side === "buy" ? "paid" : "received"}
                </div>
                <div className="text-3xl font-bold mono mt-2"
                  style={{ color: viewing.side === "buy" ? "var(--text)" : "var(--green)" }}>
                  {formatCurrency(viewing.total)}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  <LiveDate ts={viewing.createdAt} mode="datetime" />
                </div>
              </div>

              {/* Detail rows */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {[
                  ["Side",       viewing.side.toUpperCase(), viewing.side === "buy" ? "var(--green)" : "var(--red)"],
                  ["Asset",      viewing.asset],
                  ["Quantity",   viewing.quantity.toFixed(8)],
                  ["Price",      formatCurrency(viewing.pricePerUnit) + " / unit"],
                  ["Order type", viewing.orderType.toUpperCase()],
                  ["Fee",        formatCurrency(viewing.fee)],
                  ["Reference",  viewing.reference],
                ].map(([k, v, color], i) => (
                  <div key={k as string}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                    style={{ background: i % 2 === 0 ? "transparent" : "var(--panel-2)", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ color: "var(--muted)" }}>{k}</span>
                    <span className="mono font-medium" style={{ color: (color as string) ?? "var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-between gap-2 flex-wrap" style={{ borderColor: "var(--border)" }}>
              <StatementDownload
                title={`Trade ${viewing.reference}`}
                rows={[{
                  Date: new Date(viewing.createdAt).toISOString(),
                  Side: viewing.side.toUpperCase(),
                  Asset: viewing.asset,
                  Amount: viewing.quantity,
                  "Price (USD)": viewing.pricePerUnit,
                  "Total (USD)": viewing.total,
                  "Fee (USD)": viewing.fee,
                  "Order Type": viewing.orderType.toUpperCase(),
                  Status: viewing.status,
                  Reference: viewing.reference,
                }]}
                filename={`trade-${viewing.reference}`}
                ownerName={matchedUser?.name}
                ownerEmail={matchedUser?.email}
              />
              <button onClick={() => setViewing(null)} className="btn btn-ghost text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}