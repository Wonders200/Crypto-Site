"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminTransaction, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, Modal, Field, Input, Select, Badge, Kpi } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import {
  Hash, Image as ImageIcon, Copy, Check, ChevronDown, ChevronRight,
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, Wallet, Search,
  Layers, X as XIcon, Trash2, Plus, Minus, Clock, AlertTriangle, ExternalLink,
} from "lucide-react";

const empty = (): AdminTransaction => ({
  id: "", userId: "", type: "deposit", amount: 0, currency: "USD",
  status: "pending", description: "", createdAt: Date.now(),
});

function txIcon(type: string) {
  if (type === "deposit") return <ArrowDownToLine size={13} />;
  if (type === "withdrawal") return <ArrowUpFromLine size={13} />;
  if (type === "reward") return <TrendingUp size={13} />;
  return <Wallet size={13} />;
}

function badgeKind(type: string): "green" | "red" | "amber" | "blue" | "gray" {
  if (type === "deposit" || type === "reward") return "green";
  if (type === "withdrawal") return "red";
  if (type === "fee") return "amber";
  if (type === "trade") return "blue";
  return "gray";
}

export default function AdminTransactionsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const [editing, setEditing] = useState<AdminTransaction | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [proofViewer, setProofViewer] = useState<AdminTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deducting, setDeducting] = useState<{ userId: string; name: string; balance: number } | null>(null);
  const [deductAmount, setDeductAmount] = useState("");
  const [deductReason, setDeductReason] = useState("");
  const [deductError, setDeductError] = useState("");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("pending");
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdrawal" | "trade" | "fee" | "reward">("all");

  const grouped = useMemo(() => {
    const g: Record<string, AdminTransaction[]> = {};
    for (const t of store.transactions) {
      const key = t.userId || "unknown";
      (g[key] = g[key] ?? []).push(t);
    }
    for (const k of Object.keys(g)) g[k].sort((a, b) => b.createdAt - a.createdAt);
    return g;
  }, [store.transactions]);

  const customers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.users
      .filter(u => {
        const txs = grouped[u.id] ?? [];
        if (txs.length === 0) return false;
        if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) return false;
        return true;
      })
      .map(u => {
        const all = grouped[u.id] ?? [];
        const filtered = all.filter(t =>
          (statusFilter === "all" || t.status === statusFilter) &&
          (typeFilter === "all" || t.type === typeFilter)
        );
        const deposits = all.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
        const withdrawals = all.filter(t => t.type === "withdrawal").reduce((s, t) => s + Math.abs(t.amount), 0);
        const rewards = all.filter(t => t.type === "reward").reduce((s, t) => s + t.amount, 0);
        const pending = all.filter(t => t.status === "pending").length;
        const lastAt = all[0]?.createdAt ?? 0;
        const balance = store.balances.find(b => b.userId === u.id);
        return { user: u, all, filtered, deposits, withdrawals, rewards, pending, lastAt, balance };
      })
      .sort((a, b) => {
        if (a.pending !== b.pending) return b.pending - a.pending;
        return b.lastAt - a.lastAt;
      });
  }, [store.users, store.balances, grouped, q, statusFilter, typeFilter]);

  const totalIn = store.transactions.filter(t => t.amount > 0 && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalOut = store.transactions.filter(t => t.amount < 0 && t.status === "completed").reduce((s, t) => s + Math.abs(t.amount), 0);
  const pendingAll = store.transactions.filter(t => t.status === "pending").length;

  const toggleExpand = (userId: string) => setExpanded(prev => ({ ...prev, [userId]: !prev[userId] }));

  const startNew = (forUserId?: string) => {
    const t = empty();
    if (forUserId) t.userId = forUserId;
    setEditing(t);
    setIsNew(true);
  };
  const startEdit = (t: AdminTransaction) => { setEditing({ ...t }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const startDeduct = (forUserId?: string) => {
    const target = forUserId ? store.users.find(u => u.id === forUserId) : store.users[0];
    if (!target) { push({ kind: "error", title: "No customer available" }); return; }
    const bal = store.balances.find(b => b.userId === target.id);
    setDeducting({ userId: target.id, name: target.name, balance: bal?.usd ?? 0 });
    setDeductAmount("");
    setDeductReason("");
    setDeductError("");
  };

  const closeDeduct = () => {
    setDeducting(null);
    setDeductAmount("");
    setDeductReason("");
    setDeductError("");
  };

  const submitDeduct = () => {
    if (!deducting) return;
    const amt = parseFloat(deductAmount) || 0;
    if (amt <= 0) { setDeductError("Enter a positive amount."); return; }
    if (amt > deducting.balance) { setDeductError("Amount exceeds customer balance of " + formatCurrency(deducting.balance) + "."); return; }
    if (!deductReason.trim()) { setDeductError("Please provide a reason for the deduction."); return; }
    update("balances", store.balances.map(b => b.userId === deducting.userId
      ? { ...b, usd: Math.max(0, b.usd - amt), updatedAt: Date.now() }
      : b));
    const ref = "ADJ-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const t: AdminTransaction = {
      id: uid("t"),
      userId: deducting.userId,
      type: "fee",
      amount: -amt,
      currency: "USD",
      status: "completed",
      description: "Admin deduction - " + deductReason.trim(),
      createdAt: Date.now(),
      reference: ref,
    };
    update("transactions", [t, ...store.transactions]);
    log("DEDUCT", "Deduction " + formatCurrency(amt), deducting.name + " - " + deductReason.trim());
    push({ kind: "success", title: "Deducted", message: formatCurrency(amt) + " deducted from " + deducting.name + "." });
    setExpanded(prev => ({ ...prev, [deducting.userId]: true }));
    closeDeduct();
  };

  const save = () => {
    if (!editing || !editing.userId || !editing.description) {
      push({ kind: "error", title: "User and description required" });
      return;
    }
    if (isNew) {
      const t = { ...editing, id: editing.id || uid("t"), createdAt: Date.now() };
      update("transactions", [t, ...store.transactions]);
      log("CREATE", `Transaction: ${t.type}`, `${t.userId}  $${t.amount}`);
      push({ kind: "success", title: "Transaction created" });
      setExpanded(prev => ({ ...prev, [t.userId]: true }));
    } else {
      update("transactions", store.transactions.map(x => x.id === editing.id ? editing : x));
      log("UPDATE", `Transaction: ${editing.id}`, editing.description);
      push({ kind: "success", title: "Transaction updated" });
    }
    close();
  };

  const remove = (t: AdminTransaction) => {
    if (!confirm(`Delete transaction ${t.reference ?? t.id}?`)) return;
    update("transactions", store.transactions.filter(x => x.id !== t.id));
    log("DELETE", `Transaction: ${t.reference ?? t.id}`);
    push({ kind: "success", title: "Deleted" });
  };

  const approve = (t: AdminTransaction) => {
    if (!confirm(`Approve this ${t.type} of ${formatCurrency(Math.abs(t.amount))}?`)) return;

    update("transactions", store.transactions.map(x => x.id === t.id ? { ...x, status: "completed" as const } : x));

    if (t.type === "deposit") {
      update("balances", store.balances.map(b => b.userId === t.userId
        ? { ...b, usd: b.usd + t.amount, updatedAt: Date.now() }
        : b));
    }

    log("TX_APPROVED", `Transaction ${t.id}`, `${t.type}  $${Math.abs(t.amount)}`);
    push({ kind: "success", title: "Approved", message: `${formatCurrency(Math.abs(t.amount))} ${t.type} confirmed.` });
  };

  const reject = () => {
    if (!rejecting) return;
    const t = rejecting;

    update("transactions", store.transactions.map(x => x.id === t.id
      ? { ...x, status: "failed" as const, description: x.description + (rejectReason.trim() ? `  ${rejectReason.trim()}` : "") }
      : x));

    if (t.type === "withdrawal") {
      update("balances", store.balances.map(b => b.userId === t.userId
        ? { ...b, usd: b.usd + Math.abs(t.amount), updatedAt: Date.now() }
        : b));
    }

    log("TX_REJECTED", `Transaction ${t.id}`, rejectReason.trim() || "no reason given");
    push({ kind: "success", title: "Rejected", message: t.type === "withdrawal" ? "Funds returned to customer." : "Deposit declined." });
    setRejecting(null);
    setRejectReason("");
  };

  const copyHash = async (hash: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(id);
      setTimeout(() => setCopiedHash(null), 1500);
    } catch {}
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  const expandAll = () => {
    const ids = customers.map(c => c.user.id);
    const anyOpen = ids.some(id => expanded[id]);
    const next: Record<string, boolean> = {};
    if (!anyOpen) ids.forEach(id => { next[id] = true; });
    setExpanded(next);
  };

  return (
    <div>
      <PageHeader
        title="Customer Activity"
        subtitle={`${store.transactions.length} records  ${pendingAll} pending approval`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => startDeduct()} className="px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
              <Minus size={13} /> Deduct Transaction
            </button>
            <Btn onClick={() => startNew()}>+ Add Transaction</Btn>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Pending approvals" value={String(pendingAll)} tone={pendingAll > 0 ? "amber" : "default"} sub={pendingAll > 0 ? "Needs your attention" : "All clear"} />
        <Kpi label="Total in (completed)" value={formatCurrency(totalIn)} tone="green" />
        <Kpi label="Total out (completed)" value={formatCurrency(totalOut)} />
        <Kpi label="Customers with activity" value={String(Object.keys(grouped).length)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customer by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
        <div className="w-44">
          <Select value={statusFilter} onChange={v => setStatusFilter(v as any)} options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: " Pending" },
            { value: "completed", label: " Completed" },
            { value: "failed", label: " Failed" },
          ]} />
        </div>
        <div className="w-40">
          <Select value={typeFilter} onChange={v => setTypeFilter(v as any)} options={[
            { value: "all", label: "All types" },
            { value: "deposit", label: "Deposits" },
            { value: "withdrawal", label: "Withdrawals" },
            { value: "trade", label: "Trades" },
            { value: "fee", label: "Fees" },
            { value: "reward", label: "Rewards" },
          ]} />
        </div>
        <button onClick={expandAll}
          className="px-3 py-2.5 rounded-lg text-xs font-semibold"
          style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Expand / collapse all
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="panel p-16 text-center">
          <Layers size={26} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>No customers match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(({ user, all, filtered, deposits, withdrawals, rewards, pending, lastAt, balance }) => {
            const isOpen = !!expanded[user.id];
            return (
              <div key={user.id} className="panel overflow-hidden">
                <button onClick={() => toggleExpand(user.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition">
                  <div className="shrink-0">
                    {isOpen ? <ChevronDown size={16} style={{ color: "var(--muted)" }} /> : <ChevronRight size={16} style={{ color: "var(--muted)" }} />}
                  </div>
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{user.name}</span>
                      <Badge kind={user.tier === "Institutional" ? "amber" : user.tier === "Pro" ? "blue" : "gray"}>{user.tier}</Badge>
                      <Badge kind={user.status === "active" ? "green" : user.status === "suspended" ? "red" : "amber"}>{user.status}</Badge>
                      {pending > 0 && (
                        <span className="pill pill-amber flex items-center gap-1">
                          <Clock size={9} /> {pending} pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {user.email}{lastAt > 0 && <>  last activity <LiveTimeAgo ts={lastAt} /></>}
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Balance</div>
                      <div className="mono text-sm font-semibold">{formatCurrency(balance?.usd ?? 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>In</div>
                      <div className="mono text-sm font-semibold" style={{ color: "var(--green)" }}>+{formatCurrency(deposits)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Out</div>
                      <div className="mono text-sm font-semibold">{formatCurrency(withdrawals)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Txns</div>
                      <div className="mono text-sm font-semibold">{all.length}</div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t" style={{ borderColor: "var(--border)" }}>
                    {filtered.length === 0 ? (
                      <div className="p-8 text-center text-xs" style={{ color: "var(--muted)" }}>
                        No transactions match the current filters.
                      </div>
                    ) : (
                      <>
                        {filtered.map(t => {
                          const pos = t.amount >= 0;
                          const isPending = t.status === "pending";
                          return (
                            <div key={t.id}
                              className="px-5 py-4 border-b text-sm"
                              style={{
                                borderColor: "var(--border)",
                                paddingLeft: 56,
                                background: isPending ? "rgba(227,179,65,0.04)" : "transparent",
                              }}>
                              {/* Row 1: icon + description + amount + status + actions */}
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: pos ? "var(--green-dim)" : "var(--red-dim)", color: pos ? "var(--green)" : "var(--red)" }}>
                                  {txIcon(t.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium truncate">{t.description || `${t.type}  ${t.id}`}</span>
                                    <Badge kind={badgeKind(t.type)}>{t.type}</Badge>
                                    {isPending && <span className="pill pill-amber">NEEDS REVIEW</span>}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] mt-1 flex-wrap" style={{ color: "var(--muted)" }}>
                                    <span className="mono">{t.reference ?? t.id}</span>
                                    <span></span>
                                    <LiveTimeAgo ts={t.createdAt} />
                                    {t.network && <><span></span><span>{t.network}</span></>}
                                  </div>
                                </div>

                                <div className="text-right shrink-0 w-28">
                                  <div className="mono font-semibold" style={{ color: pos ? "var(--green)" : "var(--text)" }}>
                                    {pos ? "+" : ""}{formatCurrency(t.amount)}
                                  </div>
                                  <div className="text-[10px] mono" style={{ color: "var(--muted)" }}>{t.currency}</div>
                                </div>

                                <div className="shrink-0 w-24 text-center">
                                  <Badge kind={t.status === "completed" ? "green" : t.status === "pending" ? "amber" : "red"}>{t.status}</Badge>
                                </div>

                                <div className="flex justify-end gap-1.5 shrink-0">
                                  {isPending ? (
                                    <>
                                      <button onClick={() => approve(t)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                                        style={{ background: "var(--green)", color: "#0a0b0f" }}>
                                        <Check size={11} /> Approve
                                      </button>
                                      <button onClick={() => { setRejecting(t); setRejectReason(""); }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                                        style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
                                        <XIcon size={11} /> Decline
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <Btn kind="ghost" size="sm" onClick={() => startEdit(t)}>Edit</Btn>
                                      <button onClick={() => remove(t)}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                                        style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
                                        <Trash2 size={11} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: PROOF OF PAYMENT  always visible */}
                              {(t.txHash || t.proofUrl) ? (
                                <div className="mt-3 ml-12 flex items-start gap-4 flex-wrap p-3 rounded-xl"
                                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                                  <div className="text-[10px] uppercase tracking-wider font-semibold shrink-0 pt-1" style={{ color: "var(--muted)" }}>
                                    Proof of payment
                                  </div>

                                  {/* Hash pill */}
                                  {t.txHash ? (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Hash size={12} style={{ color: "var(--accent)" }} />
                                      <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>Hash:</span>
                                      <button onClick={() => copyHash(t.txHash!, t.id)}
                                        className="mono text-[11px] font-semibold px-2 py-1 rounded-md transition hover:opacity-80 inline-flex items-center gap-1.5"
                                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                                        title={t.txHash}>
                                        <span className="truncate max-w-[220px]">{t.txHash}</span>
                                        {copiedHash === t.id
                                          ? <Check size={10} style={{ color: "var(--green)" }} />
                                          : <Copy size={10} />}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]" style={{ color: "var(--muted-2)" }}>
                                      <Hash size={12} /> No hash provided
                                    </div>
                                  )}

                                  {/* Screenshot thumbnail */}
                                  {t.proofUrl ? (
                                    <button onClick={() => setProofViewer(t)}
                                      className="flex items-center gap-2 shrink-0 group">
                                      <img src={t.proofUrl} alt="Proof"
                                        className="w-14 h-14 rounded-lg object-cover cursor-zoom-in transition group-hover:opacity-90"
                                        style={{ border: "1px solid var(--green)", boxShadow: "0 0 0 2px rgba(63,185,80,0.15)" }} />
                                      <div className="text-[11px] flex flex-col items-start gap-0.5">
                                        <span className="font-semibold inline-flex items-center gap-1" style={{ color: "var(--green)" }}>
                                          <ImageIcon size={11} /> Screenshot
                                        </span>
                                        <span style={{ color: "var(--muted)" }}>click to enlarge</span>
                                      </div>
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]" style={{ color: "var(--muted-2)" }}>
                                      <ImageIcon size={12} /> No screenshot
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-3 ml-12 flex items-center gap-2 p-3 rounded-xl text-[11px]"
                                  style={{ background: "rgba(227,179,65,0.06)", border: "1px dashed rgba(227,179,65,0.3)", color: "var(--muted)" }}>
                                  <AlertTriangle size={12} style={{ color: "var(--amber)" }} />
                                  No proof of payment attached
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div className="px-5 py-3 flex items-center justify-between" style={{ paddingLeft: 56 }}>
                          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                            {filtered.length} of {all.length} shown
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startDeduct(user.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
                              <Minus size={11} /> Deduct
                            </button>
                            <Btn kind="ghost" size="sm" onClick={() => startNew(user.id)}>
                              <Plus size={12} /> Add for {user.name.split(" ")[0]}
                            </Btn>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create modal */}
      <Modal open={!!editing} onClose={close} title={isNew ? "Add Transaction" : "Edit Transaction"}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Account">
              <Select value={editing.userId} onChange={v => setField("userId", v)}
                options={store.users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))} />
            </Field>
            <Field label="Type">
              <Select value={editing.type} onChange={v => setField("type", v)} options={[
                { value: "deposit", label: "Deposit" }, { value: "withdrawal", label: "Withdrawal" },
                { value: "trade", label: "Trade" }, { value: "fee", label: "Fee" }, { value: "reward", label: "Reward" }]} />
            </Field>
            <Field label="Amount"><Input value={editing.amount} onChange={v => setField("amount", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Currency"><Input value={editing.currency} onChange={v => setField("currency", v)} /></Field>
            <Field label="Status">
              <Select value={editing.status} onChange={v => setField("status", v)} options={[
                { value: "pending", label: "Pending" }, { value: "completed", label: "Completed" }, { value: "failed", label: "Failed" }]} />
            </Field>
            <Field label="Reference"><Input value={editing.reference ?? ""} onChange={v => setField("reference", v)} /></Field>
            <div className="col-span-2"><Field label="Description"><Input value={editing.description} onChange={v => setField("description", v)} /></Field></div>
            <div className="col-span-2"><Field label="Transaction hash"><Input value={editing.txHash ?? ""} onChange={v => setField("txHash", v)} /></Field></div>
          </div>
        )}
      </Modal>

      {/* Proof viewer */}
      <Modal open={!!proofViewer} onClose={() => setProofViewer(null)}
        title={proofViewer ? `Proof  ${proofViewer.reference ?? proofViewer.id}` : "Proof"}
        footer={proofViewer?.proofUrl && (
          <a href={proofViewer.proofUrl} download={proofViewer.proofName || "proof.jpg"} target="_blank" rel="noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border-2)" }}>
            <ExternalLink size={13} /> Download
          </a>
        )}>
        {proofViewer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>Amount</div><div className="mono font-semibold mt-1">{formatCurrency(proofViewer.amount)}</div></div>
              <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>Reference</div><div className="mono font-semibold mt-1">{proofViewer.reference ?? proofViewer.id}</div></div>
            </div>
            {proofViewer.txHash && (
              <div>
                <div className="text-xs uppercase mb-1" style={{ color: "var(--muted)" }}>Transaction hash</div>
                <div className="flex items-stretch gap-2">
                  <div className="mono text-xs break-all p-2.5 rounded flex-1"
                    style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                    {proofViewer.txHash}
                  </div>
                  <button onClick={() => copyHash(proofViewer.txHash!, proofViewer.id)}
                    className="px-3 rounded text-xs font-semibold shrink-0 inline-flex items-center gap-1"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                    {copiedHash === proofViewer.id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              </div>
            )}
            {proofViewer.proofUrl ? (
              <a href={proofViewer.proofUrl} target="_blank" rel="noreferrer">
                <img src={proofViewer.proofUrl} alt="proof"
                  className="rounded-lg w-full object-contain max-h-[500px] cursor-zoom-in"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }} />
              </a>
            ) : (
              <div className="p-10 text-center text-sm" style={{ color: "var(--muted)" }}>No screenshot attached.</div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejecting} onClose={() => { setRejecting(null); setRejectReason(""); }} title="Decline transaction"
        footer={<>
          <Btn kind="ghost" onClick={() => { setRejecting(null); setRejectReason(""); }}>Cancel</Btn>
          <Btn kind="danger" onClick={reject}>Decline</Btn>
        </>}>
        {rejecting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {rejecting.type === "withdrawal"
                ? "Funds will be returned to the customer's balance."
                : "The deposit will not be credited to the customer."}
            </p>
            <Field label="Reason (optional)">
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                placeholder="e.g. Invalid hash, screenshot doesn't match, etc."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </Field>
          </div>
        )}
      </Modal>

      {/* Deduct modal */}
      <Modal open={!!deducting} onClose={closeDeduct} title="Deduct from customer"
        footer={<>
          <Btn kind="ghost" onClick={closeDeduct}>Cancel</Btn>
          <Btn kind="danger" onClick={submitDeduct}>Deduct</Btn>
        </>}>
        {deducting && (
          <div className="space-y-4">
            <Field label="Customer">
              <Select value={deducting.userId} onChange={v => {
                const u = store.users.find(x => x.id === v);
                if (u) {
                  const bal = store.balances.find(b => b.userId === u.id);
                  setDeducting({ userId: u.id, name: u.name, balance: bal?.usd ?? 0 });
                }
              }} options={store.users.map(u => ({ value: u.id, label: u.name + " (" + u.email + ")" }))} />
            </Field>

            <div className="rounded-xl p-3 text-xs" style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              Current balance: <span className="mono font-semibold" style={{ color: "var(--text)" }}>{formatCurrency(deducting.balance)}</span>
            </div>

            <Field label="Amount to deduct (USD)">
              <Input value={deductAmount} onChange={(v) => { setDeductAmount(v); setDeductError(""); }} type="number" />
            </Field>

            <Field label="Reason for deduction (required)">
              <textarea value={deductReason} onChange={e => { setDeductReason(e.target.value); setDeductError(""); }} rows={3}
                placeholder="e.g. Chargeback, incorrect credit, account adjustment..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </Field>

            {deductError && (
              <div className="rounded-lg p-3 text-xs flex items-start gap-2" style={{ background: "var(--red-dim)", border: "1px solid var(--red)", color: "var(--red)" }}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {deductError}
              </div>
            )}

            <div className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              This immediately reduces the customer balance and creates an audit record.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}