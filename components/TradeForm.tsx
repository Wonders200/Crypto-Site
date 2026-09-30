"use client";
import { useState } from "react";
import { useToast, usePortfolio, useAdminStore } from "@/app/providers";
import { formatCurrency } from "@/lib/format";
import { uid, AdminTransaction } from "@/lib/adminStore";
import type { Coin } from "@/lib/cryptoData";
import { broadcast } from "@/lib/realtime";

type OrderType = "market" | "limit" | "stop";

export default function TradeForm({ coin }: { coin: Coin }) {
  const { push } = useToast();
  const { addHolding } = usePortfolio();
  const { store, update, log } = useAdminStore();

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<OrderType>("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState(coin.price.toFixed(2));
  const [submitting, setSubmitting] = useState(false);

  const amt = parseFloat(amount) || 0;
  const px = type === "market" ? coin.price : parseFloat(limitPrice) || coin.price;
  const total = amt * px;
  const fee = total * 0.001; // 0.10%

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amt <= 0) {
      push({ kind: "error", title: "Enter an amount", message: "How much do you want to trade?" });
      return;
    }
    if (total < 10) {
      push({ kind: "error", title: "Minimum $10", message: "Order value must be at least $10." });
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));

    // 1. Update holdings (existing behavior)
    if (side === "buy") {
      addHolding({ coinId: coin.id, amount: amt, avgBuyPrice: px, acquiredAt: Date.now() });
    } else {
      // for sells, we would subtract; keep simple for now
      addHolding({ coinId: coin.id, amount: -amt, avgBuyPrice: px, acquiredAt: Date.now() });
    }

    // 2. Log trade to store.transactions so it shows up in history
    const ref = `${side === "buy" ? "BUY" : "SELL"}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const tradeRecord: AdminTransaction = {
      id: uid("t"),
      userId: "demo-user", // will be matched by email in history view
      type: "trade",
      amount: side === "buy" ? -total : total,
      currency: "USD",
      status: "completed",
      description: `${side === "buy" ? "Bought" : "Sold"} ${amt} ${coin.symbol} @ ${formatCurrency(px)}  ${type.toUpperCase()}`,
      createdAt: Date.now(),
      reference: ref,
      asset: coin.symbol,
      network: coin.category,
      // @ts-ignore  extended fields
      side,
      orderType: type,
      quantity: amt,
      pricePerUnit: px,
      fee,
    };

    update("transactions", [tradeRecord, ...store.transactions]);
    broadcast("CUSTOMER_ACTION", `${side === "buy" ? "Bought" : "Sold"} ${amt} ${coin.symbol} @ ${formatCurrency(px)}`, { payload: { type: "trade", side, amount: amt, symbol: coin.symbol } });
    log(side === "buy" ? "TRADE_BUY" : "TRADE_SELL", `${amt} ${coin.symbol} @ ${formatCurrency(px)}`, `$${total.toFixed(2)}  ${type}`);

    push({
      kind: "success",
      title: side === "buy" ? "Order filled " : "Order filled",
      message: `${side === "buy" ? "Bought" : "Sold"} ${amt} ${coin.symbol} at ${formatCurrency(px)}`,
    });
    setAmount("");
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="panel p-4 space-y-4">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: "var(--panel-2)" }}>
        {(["buy", "sell"] as const).map(s => (
          <button key={s} type="button" onClick={() => setSide(s)}
            className="py-2.5 rounded-md text-sm font-semibold capitalize transition"
            style={{
              background: side === s ? (s === "buy" ? "var(--green)" : "var(--red)") : "transparent",
              color: side === s ? "#0a0b0f" : "var(--muted)",
            }}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--panel-2)" }}>
        {(["market", "limit", "stop"] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className="flex-1 py-1.5 rounded-md text-xs font-medium capitalize"
            style={{
              background: type === t ? "var(--panel)" : "transparent",
              color: type === t ? "var(--text)" : "var(--muted)",
            }}>
            {t}
          </button>
        ))}
      </div>

      {type !== "market" && (
        <label className="block">
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
            <span>{type === "limit" ? "Limit price" : "Stop price"}</span>
            <button type="button" onClick={() => setLimitPrice(coin.price.toFixed(2))} className="hover:opacity-80">Market</button>
          </div>
          <div className="relative">
            <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} inputMode="decimal"
              className="w-full px-3 py-2.5 pr-14 rounded-lg mono text-sm outline-none"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--muted)" }}>USDT</span>
          </div>
        </label>
      )}

      <label className="block">
        <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Amount</span>
          <span className="mono">Avail: </span>
        </div>
        <div className="relative">
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" inputMode="decimal"
            className="w-full px-3 py-2.5 pr-16 rounded-lg mono text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: "var(--muted)" }}>{coin.symbol}</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[25, 50, 75, 100].map(p => (
            <button key={p} type="button" onClick={() => setAmount(((1000 * p / 100) / px).toFixed(6))}
              className="flex-1 py-1 rounded text-xs"
              style={{ background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              {p}%
            </button>
          ))}
        </div>
      </label>

      <div className="pt-2 space-y-1.5 text-xs border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Order value</span><span className="mono">{formatCurrency(total)}</span></div>
        <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Est. fee (0.10%)</span><span className="mono">{formatCurrency(fee)}</span></div>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-lg font-semibold text-sm transition disabled:opacity-60"
        style={{ background: side === "buy" ? "var(--green)" : "var(--red)", color: "#0a0b0f" }}>
        {submitting ? "Placing order" : `${side === "buy" ? "Buy" : "Sell"} ${coin.symbol}`}
      </button>
    </form>
  );
}