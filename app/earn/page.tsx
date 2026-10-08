"use client";
import CoinIcon from "@/components/CoinIcon";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth, useAdminStore, useToast } from "@/app/providers";
import { AdminEarnProduct, AdminEarnPosition, uid } from "@/lib/adminStore";
import { kycStatusFromStore } from "@/lib/kyc";
import { formatCurrency } from "@/lib/format";
import { computeAccrued, dailyRate } from "@/lib/earn";
import KycBanner from "@/components/KycBanner";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { X, AlertTriangle, Calculator, Wallet, TrendingUp, Clock, Calendar } from "lucide-react";

const MIN_DEPOSIT = 200;

export default function EarnPage() {
  const { user } = useAuth();
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const [selected, setSelected] = useState<AdminEarnProduct | null>(null);
  const [detail, setDetail] = useState<AdminEarnPosition | null>(null);
  const [amount, setAmount] = useState("200");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const products = (store.earnProducts ?? []).filter(p => p.enabled);
  const maxApy = products.length > 0 ? Math.max(...products.map(p => p.apy)) : 0;

  const demoEmail = store.demoUser?.email ?? "demo@apexvault.io";
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase())
    ?? store.users[0];

  const kycStatus = kycStatusFromStore(store, matchedUser);
  const kycOk = kycStatus === "verified";

  const balance = store.balances.find(b => b.userId === matchedUser?.id);
  const positions = useMemo(
    () => (store.earnPositions ?? []).filter(p => p.userId === matchedUser?.id).sort((a, b) => b.startedAt - a.startedAt),
    [store.earnPositions, matchedUser?.id]
  );

  const totalEarning = positions.filter(p => p.status === "active").reduce((s, p) => s + p.amountUsd, 0);
  const totalAccrued = positions.reduce((s, p) => s + computeAccrued(p), 0);

  const openSubscribe = (p: AdminEarnProduct) => {
    if (!user) { push({ kind: "info", title: "Sign in first" }); return; }
    if (!kycOk) { push({ kind: "info", title: "Verify your identity first" }); return; }
    setSelected(p);
    setAmount(String(MIN_DEPOSIT));
    setError("");
  };

  const closeModal = () => { if (!submitting) { setSelected(null); setError(""); } };
  const closeDetail = () => setDetail(null);

  const subscribe = async () => {
    if (!selected || !matchedUser) return;
    setError("");
    const amt = parseFloat(amount) || 0;
    if (amt < MIN_DEPOSIT) { setError("Minimum deposit is " + formatCurrency(MIN_DEPOSIT) + "."); return; }
    if (!balance || amt > balance.usd) { setError("Only " + formatCurrency(balance?.usd ?? 0) + " available."); return; }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const now = Date.now();
    const maturesAt = selected.lockup && selected.lockup !== "None"
      ? now + (parseInt(selected.lockup) || 0) * 86400000
      : undefined;

    const position: AdminEarnPosition = {
      id: uid("ep"), userId: matchedUser.id, productId: selected.id,
      asset: selected.asset, amountUsd: amt, apy: selected.apy,
      startedAt: now, maturesAt, status: "active" as const, accrued: 0, lastAccrualAt: now,
    };

    update("balances", store.balances.map(b => b.userId === matchedUser.id
      ? { ...b, usd: Math.max(0, b.usd - amt), updatedAt: now }
      : b));

    update("earnPositions", [position, ...(store.earnPositions ?? [])]);

    update("transactions", [{
      id: uid("t"), userId: matchedUser.id, type: "fee" as any, amount: -amt,
      currency: "USD", status: "completed" as any,
      description: "Subscribed to " + selected.asset + " " + selected.tier + " earn @ " + selected.apy + "% APY",
      createdAt: now, reference: "EARN-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    } as any, ...store.transactions]);

    log("EARN_SUBSCRIBE", "$" + amt.toLocaleString() + " into " + selected.asset, matchedUser.email);
    push({ kind: "success", title: "Earning started!", message: "$" + amt.toLocaleString() + " is now earning " + selected.apy + "% APY." });
    setSubmitting(false); setSelected(null); setAmount(String(MIN_DEPOSIT));
  };

  const withdraw = (position: AdminEarnPosition) => {
    if (!matchedUser) return;
    if (position.maturesAt && position.maturesAt > Date.now()) {
      push({ kind: "error", title: "Still locked" }); return;
    }
    const liveAccrued = computeAccrued(position);
    const payout = position.amountUsd + liveAccrued;
    if (!confirm("Withdraw $" + position.amountUsd.toLocaleString() + " + $" + liveAccrued.toFixed(2) + " accrued = $" + payout.toFixed(2) + "?")) return;
    update("balances", store.balances.map(b => b.userId === matchedUser.id
      ? { ...b, usd: b.usd + payout, updatedAt: Date.now() } : b));
    update("earnPositions", (store.earnPositions ?? []).map(p => (p.id === position.id
      ? { ...p, status: "withdrawn" as const, accrued: liveAccrued } : p)));
    log("EARN_WITHDRAW", "$" + payout.toLocaleString() + " from " + position.asset, matchedUser.email);
    push({ kind: "success", title: "Withdrawn", message: "$" + payout.toLocaleString() + " returned to your balance." });
    setDetail(null);
  };

  const previewAmt = parseFloat(amount) || 0;
  const yearly = selected ? (previewAmt * selected.apy) / 100 : 0;
  const monthly = yearly / 12;
  const daily = yearly / 365;

  const daysUntil = (ts: number) => Math.max(0, Math.ceil((ts - Date.now()) / 86400000));

  const detailAccrued = detail ? computeAccrued(detail) : 0;
  const detailDaily = detail ? dailyRate(detail) : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6 md:mb-10">
        <span className="pill pill-green inline-flex mb-3">Up to {maxApy.toFixed(1)}% APY</span>
        <h1 className="text-2xl md:text-4xl font-bold">Earn yield on your assets</h1>
        <p className="mt-3 md:mt-4 text-sm md:text-lg max-w-2xl" style={{ color: "var(--muted)" }}>
          Put idle crypto to work. Flexible products pay out daily  no lock-up required.
        </p>
        <p className="mt-3 text-xs md:text-sm" style={{ color: "var(--muted)" }}>
          Minimum deposit: <strong style={{ color: "var(--text)" }}>{formatCurrency(MIN_DEPOSIT)}</strong>
        </p>
      </div>

      <div className="mb-6"><KycBanner /></div>

      {user && positions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="panel p-4 md:p-5">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Currently earning</div>
            <div className="text-xl md:text-2xl font-bold mono mt-2">{formatCurrency(totalEarning)}</div>
          </div>
          <div className="panel p-4 md:p-5">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Rewards accrued</div>
            <div className="text-xl md:text-2xl font-bold mono mt-2" style={{ color: "var(--green)" }}>+{formatCurrency(totalAccrued)}</div>
          </div>
          <div className="panel p-4 md:p-5">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Active positions</div>
            <div className="text-xl md:text-2xl font-bold mono mt-2">{positions.filter(p => p.status === "active").length}</div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="panel p-12 text-center" style={{ color: "var(--muted)" }}>No products available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {products.map(p => (
            <div key={p.id} className="panel p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <CoinIcon symbol={p.asset} color={p.color} size={44} />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{p.asset}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{p.tier}</div>
                </div>
                <span className={"pill " + (p.risk === "Low" ? "pill-green" : p.risk === "Med" ? "pill-blue" : "pill-amber")}>
                  {p.risk} risk
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold mono" style={{ color: "var(--green)" }}>
                {p.apy.toFixed(2)}<span className="text-lg">% APY</span>
              </div>
              <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t space-y-2 text-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Lock-up</span><span>{p.lockup}</span></div>
                <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Minimum</span><span className="mono">{formatCurrency(MIN_DEPOSIT)}</span></div>
                <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Payout</span><span>Daily</span></div>
              </div>
              <button onClick={() => openSubscribe(p)} disabled={!kycOk}
                className="w-full mt-4 md:mt-5 py-3 rounded-xl text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--green)" }}>
                {kycOk ? "Start earning" : "Verify to earn"}
              </button>
            </div>
          ))}
        </div>
      )}

      {user && positions.length > 0 && (
        <div className="mt-8 md:mt-10">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">My positions</h2>
          <div className="space-y-3">
            {positions.map(pos => {
              const locked = !!pos.maturesAt && pos.maturesAt > Date.now();
              const accrued = computeAccrued(pos);
              const rate = dailyRate(pos);
              return (
                <button key={pos.id} onClick={() => setDetail(pos)}
                  className="panel p-4 md:p-5 flex flex-wrap items-center gap-3 md:gap-4 w-full text-left hover:bg-white/[0.02] transition">
                  <CoinIcon symbol={pos.asset} color={products.find(p => p.asset === pos.asset)?.color ?? "#5b7cfa"} size={44} />
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{pos.asset} earn</span>
                      <span className="pill pill-green">{pos.apy.toFixed(2)}% APY</span>
                      {pos.status === "active" && <span className="pill pill-blue">ACTIVE</span>}
                      {pos.status === "withdrawn" && <span className="pill pill-gray">WITHDRAWN</span>}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Started <LiveTimeAgo ts={pos.startedAt} />
                      {pos.maturesAt && <>  {locked ? "unlocks in " + daysUntil(pos.maturesAt) + " days" : "unlocked"}</>}
                      {"  tap for details"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Principal</div>
                    <div className="mono font-semibold">{formatCurrency(pos.amountUsd)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Accrued</div>
                    <div className="mono font-semibold" style={{ color: "var(--green)" }}>+{formatCurrency(accrued)}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted-2)" }}>{formatCurrency(rate)}/day</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="panel p-6 md:p-8 mt-8 md:mt-10">
        <h2 className="text-lg md:text-xl font-semibold mb-3">Risk disclosure</h2>
        <p className="text-xs md:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Staking involves locking your assets. Rewards are variable and not guaranteed. Read the full{" "}
          <Link href="/legal/disclosures" className="underline" style={{ color: "var(--accent)" }}>risk disclosures</Link>.
        </p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={closeModal}>
          <div className="panel w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <CoinIcon symbol={selected.asset} color={selected.color} size={40} />
                <div>
                  <div className="font-semibold">Start earning {selected.asset}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{selected.tier}  {selected.apy.toFixed(2)}% APY</div>
                </div>
              </div>
              <button onClick={closeModal} disabled={submitting} className="p-1.5 rounded hover:bg-white/5"><X size={16} /></button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between text-sm p-3 rounded-xl"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                <span className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                  <Wallet size={13} /> Available to invest
                </span>
                <span className="mono font-semibold">{formatCurrency(balance?.usd ?? 0)}</span>
              </div>
              <label className="block">
                <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>How much do you want to earn on?</div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: "var(--muted)" }}>$</span>
                  <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(""); }}
                    min={MIN_DEPOSIT} className="input w-full mono text-lg font-semibold"
                    style={{ paddingLeft: 30, paddingTop: 14, paddingBottom: 14 }} />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[200, 500, 1000, 2500].map(v => (
                    <button key={v} type="button" onClick={() => { setAmount(String(v)); setError(""); }}
                      className="py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      {formatCurrency(v)}
                    </button>
                  ))}
                </div>
              </label>
              <div className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--border-2)" }}>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  <Calculator size={12} /> Estimated rewards
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-xs" style={{ color: "var(--muted)" }}>Daily</div><div className="mono font-bold mt-1" style={{ color: "var(--green)" }}>+{formatCurrency(daily)}</div></div>
                  <div><div className="text-xs" style={{ color: "var(--muted)" }}>Monthly</div><div className="mono font-bold mt-1" style={{ color: "var(--green)" }}>+{formatCurrency(monthly)}</div></div>
                  <div><div className="text-xs" style={{ color: "var(--muted)" }}>Yearly</div><div className="mono font-bold mt-1" style={{ color: "var(--green)" }}>+{formatCurrency(yearly)}</div></div>
                </div>
              </div>
              {error && (
                <div className="rounded-xl p-3 text-xs flex items-start gap-2" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B" }}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              <button onClick={subscribe} disabled={submitting || previewAmt < MIN_DEPOSIT} className="flex-1 btn btn-primary disabled:opacity-50">
                {submitting ? "Starting..." : "Earn " + selected.apy.toFixed(2) + "% on " + formatCurrency(previewAmt)}
              </button>
              <button onClick={closeModal} disabled={submitting} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={closeDetail}>
          <div className="panel w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <CoinIcon symbol={detail.asset} color={products.find(p => p.asset === detail.asset)?.color ?? "#5b7cfa"} size={40} />
                <div>
                  <div className="font-semibold">{detail.asset} earn position</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{detail.apy.toFixed(2)}% APY  {detail.status.toUpperCase()}</div>
                </div>
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded hover:bg-white/5"><X size={16} /></button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="rounded-xl p-5 text-center" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Accrued rewards</div>
                <div className="text-3xl md:text-4xl font-bold mono" style={{ color: "var(--green)" }}>+{formatCurrency(detailAccrued)}</div>
                <div className="text-xs mt-2 flex items-center justify-center gap-1" style={{ color: "var(--muted)" }}>
                  <TrendingUp size={11} /> Earning {formatCurrency(detailDaily)} per day
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Principal</div>
                  <div className="mono font-bold text-lg mt-1">{formatCurrency(detail.amountUsd)}</div>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total value</div>
                  <div className="mono font-bold text-lg mt-1" style={{ color: "var(--green)" }}>{formatCurrency(detail.amountUsd + detailAccrued)}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <span className="flex items-center gap-2" style={{ color: "var(--muted)" }}><Clock size={12} /> Started</span>
                  <span>{new Date(detail.startedAt).toLocaleDateString()}</span>
                </div>
                {detail.maturesAt && (
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <span className="flex items-center gap-2" style={{ color: "var(--muted)" }}><Calendar size={12} /> Unlocks</span>
                    <span>in {daysUntil(detail.maturesAt)} days</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span style={{ color: "var(--muted)" }}>Status</span>
                  <span className="pill pill-blue">{detail.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              {detail.status === "active" && (
                <button onClick={() => withdraw(detail)} disabled={!!detail.maturesAt && detail.maturesAt > Date.now()}
                  className="flex-1 btn btn-primary disabled:opacity-50">
                  {detail.maturesAt && detail.maturesAt > Date.now()
                    ? "Locked  " + daysUntil(detail.maturesAt) + " days left"
                    : "Withdraw " + formatCurrency(detail.amountUsd + detailAccrued)}
                </button>
              )}
              <button onClick={closeDetail} className="btn btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}