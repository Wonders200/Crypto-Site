"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminHolding, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, Modal, Field, Input, Select, Kpi, Badge } from "@/components/admin/ui";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Search, ChevronDown, ChevronRight, Plus, TrendingUp, TrendingDown, Layers, Trash2 } from "lucide-react";

const empty = (): AdminHolding => ({
  id: "",
  userId: "",
  coinId: "",
  amount: 0,
  avgBuyPrice: 0,
  acquiredAt: Date.now(),
});

export default function AdminHoldingsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminHolding | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Defensive reads
  const holdings = store?.holdings ?? [];
  const users = store?.users ?? [];
  const coins = store?.coins ?? [];
  const balances = store?.balances ?? [];

  const rows = useMemo(() => {
    return holdings.map(h => {
      const user = users.find(u => u.id === h.userId);
      const coin = coins.find(c => c.id === h.coinId);
      const price = coin?.price ?? 0;
      const value = price * h.amount;
      const cost = h.avgBuyPrice * h.amount;
      const pl = value - cost;
      const plPct = cost > 0 ? (pl / cost) * 100 : 0;
      return { h, user, coin, price, value, cost, pl, plPct };
    });
  }, [holdings, users, coins]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof rows> = {};
    for (const r of rows) {
      const key = r.h.userId || "unknown";
      if (!g[key]) g[key] = [];
      g[key].push(r);
    }
    return g;
  }, [rows]);

  const totals = useMemo(() => {
    const value = rows.reduce((s, r) => s + r.value, 0);
    const cost = rows.reduce((s, r) => s + r.cost, 0);
    const pl = value - cost;
    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
    return { value, cost, pl, plPct, count: rows.length, users: Object.keys(grouped).length };
  }, [rows, grouped]);

  const customers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users
      .filter(u => {
        const uholdings = grouped[u.id] ?? [];
        if (uholdings.length === 0) return false;
        if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) return false;
        return true;
      })
      .map(u => {
        const uholdings = grouped[u.id] ?? [];
        const totalValue = uholdings.reduce((s, r) => s + r.value, 0);
        const totalCost = uholdings.reduce((s, r) => s + r.cost, 0);
        const totalPl = totalValue - totalCost;
        const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;
        const balance = balances.find(b => b.userId === u.id);
        return { user: u, holdings: uholdings, totalValue, totalCost, totalPl, totalPlPct, balance };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [users, balances, grouped, q]);

  const toggle = (userId: string) => setExpanded(prev => ({ ...prev, [userId]: !prev[userId] }));

  const startNew = (forUserId?: string) => {
    const h = empty();
    if (forUserId) h.userId = forUserId;
    setEditing(h);
    setIsNew(true);
  };
  const startEdit = (h: AdminHolding) => { setEditing({ ...h }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.userId || !editing.coinId) {
      push({ kind: "error", title: "User and asset required" });
      return;
    }
    if (isNew) {
      const h = { ...editing, id: editing.id || uid("h") };
      update("holdings", [h, ...holdings]);
      log("CREATE", "Holding: " + h.coinId, h.userId + "  " + h.amount);
      push({ kind: "success", title: "Holding added" });
      setExpanded(prev => ({ ...prev, [h.userId]: true }));
    } else {
      update("holdings", holdings.map(h => (h.id === editing.id ? editing : h)));
      log("UPDATE", "Holding: " + editing.coinId, editing.userId);
      push({ kind: "success", title: "Holding updated" });
    }
    close();
  };

  const remove = (h: AdminHolding) => {
    if (!confirm("Delete this holding?")) return;
    update("holdings", holdings.filter(x => x.id !== h.id));
    log("DELETE", "Holding " + h.id);
    push({ kind: "success", title: "Holding deleted" });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Holdings"
        subtitle="Every position across every customer"
        actions={<Btn onClick={() => startNew()}>+ Add Holding</Btn>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total value" value={formatCurrency(totals.value)} tone="green" sub={totals.count + " positions  " + totals.users + " customers"} />
        <Kpi label="Total cost" value={formatCurrency(totals.cost)} />
        <Kpi label="Unrealized P/L" value={(totals.pl >= 0 ? "+" : "") + formatCurrency(totals.pl)} tone={totals.pl >= 0 ? "green" : "red"} />
        <Kpi label="Return" value={formatPercent(totals.plPct)} tone={totals.plPct >= 0 ? "green" : "red"} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customer by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
        <button onClick={() => {
          const ids = customers.map(c => c.user.id);
          const anyOpen = ids.some(id => expanded[id]);
          const next: Record<string, boolean> = {};
          if (!anyOpen) ids.forEach(id => { next[id] = true; });
          setExpanded(next);
        }} className="px-3 py-2.5 rounded-lg text-xs font-semibold"
          style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Expand / collapse all
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="panel p-16 text-center">
          <Layers size={26} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>No holdings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(({ user, holdings: uholdings, totalValue, totalPl, totalPlPct, balance }) => {
            const isOpen = !!expanded[user.id];
            const pos = totalPl >= 0;
            return (
              <div key={user.id} className="panel overflow-hidden">
                <button onClick={() => toggle(user.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition">
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
                      <Badge kind="gray">{uholdings.length} position{uholdings.length === 1 ? "" : "s"}</Badge>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{user.email}</div>
                  </div>
                  <div className="hidden lg:flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Cash</div>
                      <div className="mono text-sm font-semibold">{formatCurrency(balance?.usd ?? 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Holdings</div>
                      <div className="mono text-sm font-semibold">{formatCurrency(totalValue)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>P/L</div>
                      <div className="mono text-sm font-semibold" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                        {pos ? "+" : ""}{formatCurrency(totalPl)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Return</div>
                      <div className="mono text-sm font-semibold" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                        {formatPercent(totalPlPct)}
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t" style={{ borderColor: "var(--border)" }}>
                    {uholdings.map(r => {
                      const pos2 = r.pl >= 0;
                      return (
                        <div key={r.h.id} className="py-3 pr-5 flex items-center gap-4 hover:bg-white/[0.02] transition border-b"
                          style={{ borderColor: "var(--border)", paddingLeft: 56 }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ background: r.coin?.color ?? "#5b7cfa", color: "#0a0b0f" }}>
                            {r.coin?.symbol.slice(0, 1) ?? "?"}
                          </div>
                          <div className="w-32 shrink-0">
                            <div className="font-semibold text-sm">{r.coin?.symbol ?? ""}</div>
                            <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{r.coin?.name ?? ""}</div>
                          </div>
                          <div className="w-28 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>Amount</div>
                            <div className="mono text-sm">{r.h.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                          </div>
                          <div className="w-28 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>Avg cost</div>
                            <div className="mono text-sm" style={{ color: "var(--muted)" }}>{formatCurrency(r.h.avgBuyPrice)}</div>
                          </div>
                          <div className="w-28 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>Price</div>
                            <div className="mono text-sm">{formatCurrency(r.price)}</div>
                          </div>
                          <div className="w-32 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>Value</div>
                            <div className="mono text-sm font-semibold">{formatCurrency(r.value)}</div>
                          </div>
                          <div className="w-32 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>P/L</div>
                            <div className="mono text-sm font-semibold" style={{ color: pos2 ? "var(--green)" : "var(--red)" }}>
                              {pos2 ? "+" : ""}{formatCurrency(r.pl)}
                            </div>
                          </div>
                          <div className="w-24 text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-2)" }}>Return</div>
                            <div className="inline-flex items-center gap-1 mono text-sm font-semibold"
                              style={{ color: pos2 ? "var(--green)" : "var(--red)" }}>
                              {pos2 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {formatPercent(r.plPct)}
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 shrink-0 w-40">
                            <Btn kind="ghost" size="sm" onClick={() => startEdit(r.h)}>Edit</Btn>
                            <Btn kind="danger" size="sm" onClick={() => remove(r.h)} title="Delete">
                              <Trash2 size={11} /> Delete
                            </Btn>
                          </div>
                        </div>
                      );
                    })}
                    <div className="px-5 py-3 flex items-center justify-between" style={{ paddingLeft: 56 }}>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                        {uholdings.length} holding{uholdings.length === 1 ? "" : "s"}  Total <strong className="mono" style={{ color: "var(--text)" }}>{formatCurrency(totalValue)}</strong>
                      </div>
                      <Btn kind="ghost" size="sm" onClick={() => startNew(user.id)}><Plus size={12} /> Add for {user.name.split(" ")[0]}</Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={close}
        title={isNew ? "Add Holding" : "Edit Holding"}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="User">
              <Select value={editing.userId} onChange={v => setField("userId", v)}
                options={users.map(u => ({ value: u.id, label: u.name + " (" + u.email + ")" }))} />
            </Field>
            <Field label="Asset">
              <Select value={editing.coinId} onChange={v => setField("coinId", v)}
                options={coins.map(c => ({ value: c.id, label: c.symbol + "  " + c.name }))} />
            </Field>
            <Field label="Amount"><Input value={editing.amount} onChange={v => setField("amount", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Avg buy price"><Input value={editing.avgBuyPrice} onChange={v => setField("avgBuyPrice", parseFloat(v) || 0)} type="number" /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}