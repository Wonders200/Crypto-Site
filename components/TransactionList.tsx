"use client";
import { useState } from "react";
import { useAuth, useAdminStore } from "@/app/providers";
import { AdminTransaction } from "@/lib/adminStore";
import { formatCurrency } from "@/lib/format";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import LiveDate from "@/components/LiveDate";
import StatementDownload from "@/components/StatementDownload";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Wallet, Clock, CheckCircle2, XCircle, Image as ImageIcon, X, Hash, ChevronRight, Copy, Check, Plus } from "lucide-react";

export default function TransactionList({ transactions }: { transactions: AdminTransaction[] }) {
  const { user } = useAuth();
  const { store } = useAdminStore();
  const [viewing, setViewing] = useState<AdminTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const demoEmail = store.demoUser?.email ?? "demo@cryptosite.io";
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase())
    ?? store.users[0];

  /* Statement rows */
  const statementRows = transactions.map(t => ({
    Date: new Date(t.createdAt).toISOString(),
    Type: t.type.toUpperCase(),
    Description: t.description,
    Amount: t.amount,
    Currency: t.currency,
    Status: t.status.toUpperCase(),
    Reference: t.reference ?? t.id,
    Network: t.network ?? "",
    "TX Hash": t.txHash ?? "",
  }));

  const iconFor = (type: string) => {
    if (type === "deposit") return <ArrowDownToLine size={16} />;
    if (type === "withdrawal") return <ArrowUpFromLine size={16} />;
    if (type === "reward") return <TrendingUp size={16} />;
    return <Wallet size={16} />;
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 1500);
    } catch {}
  };

  return (
    <>
      <div className="panel overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Recent activity</h3>
            <span className="pill pill-gray">{transactions.length}</span>
          </div>
          <StatementDownload
            title="Account History"
            rows={statementRows}
            filename="account-history"
            ownerName={matchedUser?.name}
            ownerEmail={matchedUser?.email}
          />
        </div>

        {/* Empty state */}
        {transactions.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "var(--muted)" }}>
            <Plus size={24} style={{ margin: "0 auto" }} />
            <p className="mt-3 text-sm">Nothing here yet  your first deposit will show up right here.</p>
          </div>
        ) : (
          <div>
            {transactions.map(t => {
              const pos = t.amount >= 0;
              const statusIcon = t.status === "completed"
                ? <CheckCircle2 size={12} style={{ color: "var(--green)" }} />
                : t.status === "pending"
                ? <Clock size={12} style={{ color: "var(--amber)" }} />
                : <XCircle size={12} style={{ color: "var(--red)" }} />;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setViewing(t)}
                  className="w-full text-left px-5 py-4 border-b flex items-center gap-4 text-sm hover:bg-white/[0.04] transition"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: pos ? "var(--green-dim)" : "var(--red-dim)", color: pos ? "var(--green)" : "var(--red)" }}>
                    {iconFor(t.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.description}</div>
                    <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap" style={{ color: "var(--muted)" }}>
                      <span className="uppercase tracking-wider">{t.type}</span>
                      <span></span>
                      <span className="flex items-center gap-1">{statusIcon} {t.status}</span>
                      <span></span>
                      <LiveTimeAgo ts={t.createdAt} />
                      {t.txHash && (<><span></span><span className="mono truncate max-w-[140px]">hash {t.txHash.slice(0, 10)}</span></>)}
                      {t.proofUrl && (<><span></span><span className="inline-flex items-center gap-1" style={{ color: "var(--accent)" }}><ImageIcon size={11} /> proof</span></>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mono font-semibold" style={{ color: pos ? "var(--green)" : "var(--text)" }}>
                      {pos ? "+" : ""}{formatCurrency(t.amount)}
                    </div>
                    <div className="mono text-xs" style={{ color: "var(--muted)" }}>{t.currency}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--muted-2)" }} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)" }} onClick={() => setViewing(null)}>
          <div className="panel w-full max-w-lg pop-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: viewing.amount >= 0 ? "var(--green-dim)" : "var(--red-dim)",
                    color: viewing.amount >= 0 ? "var(--green)" : "var(--red)",
                  }}>
                  {iconFor(viewing.type)}
                </div>
                <div>
                  <div className="font-semibold capitalize">{viewing.type}</div>
                  <div className="text-xs mono" style={{ color: "var(--muted)" }}>{viewing.reference ?? viewing.id}</div>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded hover:bg-white/5"><X size={16} /></button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
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
                  {viewing.amount >= 0 ? "Amount received" : "Amount sent"}
                </div>
                <div className="text-3xl font-bold mono mt-2"
                  style={{ color: viewing.amount >= 0 ? "var(--green)" : "var(--text)" }}>
                  {viewing.amount >= 0 ? "+" : ""}{formatCurrency(viewing.amount)}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  <LiveDate ts={viewing.createdAt} mode="datetime" />
                </div>
              </div>

              {/* Detail rows */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {[
                  ["Description", viewing.description],
                  ["Type", viewing.type.toUpperCase()],
                  ["Currency", viewing.currency],
                  ["Reference", viewing.reference ?? viewing.id],
                  ...(viewing.asset ? [["Asset", viewing.asset]] : []),
                  ...(viewing.network ? [["Network", viewing.network]] : []),
                ].map(([k, v], i) => (
                  <div key={k as string}
                    className="flex items-center justify-between px-4 py-2.5 text-sm gap-4"
                    style={{ background: i % 2 === 0 ? "transparent" : "var(--panel-2)", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <span className="shrink-0" style={{ color: "var(--muted)" }}>{k}</span>
                    <span className="mono font-medium truncate text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* TX hash */}
              {viewing.txHash && (
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                    <Hash size={11} /> Transaction hash
                  </div>
                  <div className="flex items-stretch gap-2">
                    <code className="mono flex-1 p-2.5 rounded-lg text-[11px] break-all"
                      style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                      {viewing.txHash}
                    </code>
                    <button onClick={() => copyHash(viewing.txHash!)}
                      className="shrink-0 px-3 rounded-lg text-xs font-semibold"
                      style={{
                        background: copiedHash === viewing.txHash ? "var(--green-dim)" : "var(--accent-dim)",
                        color: copiedHash === viewing.txHash ? "var(--green)" : "var(--accent)",
                        border: `1px solid ${copiedHash === viewing.txHash ? "var(--green)" : "var(--accent)"}`,
                      }}>
                      {copiedHash === viewing.txHash ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Proof screenshot */}
              {viewing.proofUrl && (
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>Payment proof</div>
                  <a href={viewing.proofUrl} target="_blank" rel="noreferrer">
                    <img src={viewing.proofUrl} alt="Proof"
                      className="rounded-lg w-full object-contain max-h-[280px] cursor-zoom-in"
                      style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }} />
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-between gap-2 flex-wrap" style={{ borderColor: "var(--border)" }}>
              <StatementDownload
                title={`${viewing.type.charAt(0).toUpperCase() + viewing.type.slice(1)} receipt`}
                rows={[{
                  Date: new Date(viewing.createdAt).toISOString(),
                  Type: viewing.type.toUpperCase(),
                  Description: viewing.description,
                  Amount: viewing.amount,
                  Currency: viewing.currency,
                  Status: viewing.status.toUpperCase(),
                  Reference: viewing.reference ?? viewing.id,
                  Network: viewing.network ?? "",
                  "TX Hash": viewing.txHash ?? "",
                }]}
                filename={`receipt-${viewing.reference ?? viewing.id}`}
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