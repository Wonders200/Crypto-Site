"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminBalance } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Kpi } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Search, TrendingUp, TrendingDown, Info } from "lucide-react";

export default function AdminBalancePage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const [editing, setEditing] = useState<AdminBalance | null>(null);
  const [original, setOriginal] = useState<AdminBalance | null>(null);
  const [q, setQ] = useState("");

  const totalAvailable = store.balances.reduce((s, b) => s + b.usd, 0);
  const totalLocked = store.balances.reduce((s, b) => s + b.locked, 0);
  const totalAll = totalAvailable + totalLocked;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.balances
      .filter(b => {
        if (!term) return true;
        const u = store.users.find(x => x.id === b.userId);
        if (!u) return false;
        return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      })
      .sort((a, b) => (b.usd + b.locked) - (a.usd + a.locked));
  }, [store.balances, store.users, q]);

  const startEdit = (b: AdminBalance) => {
    setEditing({ ...b });
    setOriginal({ ...b });
  };

  const close = () => {
    setEditing(null);
    setOriginal(null);
  };

  const delta = useMemo(() => {
    if (!editing || !original) return null;
    const dUsd = editing.usd - original.usd;
    const dLocked = editing.locked - original.locked;
    const dTotal = dUsd + dLocked;
    const changed = Math.abs(dUsd) > 0.001 || Math.abs(dLocked) > 0.001;
    return { dUsd, dLocked, dTotal, changed };
  }, [editing, original]);

  const save = () => {
    if (!editing || !original) return;
    if (!Number.isFinite(editing.usd) || editing.usd < 0) {
      push({ kind: "error", title: "Invalid amount", message: "Available must be 0 or greater." });
      return;
    }
    if (!Number.isFinite(editing.locked) || editing.locked < 0) {
      push({ kind: "error", title: "Invalid amount", message: "Locked must be 0 or greater." });
      return;
    }

    const user = store.users.find(x => x.id === editing.userId);
    const label = user?.email ?? editing.userId;

    update("balances", store.balances.map(b => (b.userId === editing.userId ? { ...editing, updatedAt: Date.now() } : b)));

    const parts: string[] = [];
    if (delta && Math.abs(delta.dUsd) > 0.001) parts.push(`available ${delta.dUsd >= 0 ? "+" : ""}${formatCurrency(delta.dUsd)}`);
    if (delta && Math.abs(delta.dLocked) > 0.001) parts.push(`locked ${delta.dLocked >= 0 ? "+" : ""}${formatCurrency(delta.dLocked)}`);
    const detail = parts.length > 0 ? parts.join("  ") : "no change";

    log("BALANCE_EDIT", "Balance: " + label, detail);

    push({
      kind: "success",
      title: "Balance updated",
      message: delta && delta.changed
        ? label + ": " + (delta.dTotal >= 0 ? "+" : "") + formatCurrency(delta.dTotal) + " total change"
        : label + ": no numeric change",
    });
    close();
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  const reset = () => {
    if (!original) return;
    setEditing({ ...original });
    push({ kind: "info", title: "Reset to original values" });
  };

  return (
    <div>
      <PageHeader
        title="Customer Balances"
        subtitle={store.balances.length + " accounts  USD-equivalent balance across all assets"}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Kpi label="Total available" value={formatCurrency(totalAvailable)} tone="green" sub={store.balances.length + " accounts"} />
        <Kpi label="Total locked" value={formatCurrency(totalLocked)} tone={totalLocked > 0 ? "amber" : "default"} sub="Pending withdrawals & holds" />
        <Kpi label="Grand total" value={formatCurrency(totalAll)} sub="Available + locked" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customer by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      <Panel padded={false}>
        <DataTable<AdminBalance>
          keyFn={b => b.userId}
          rows={filtered}
          empty={q ? "No accounts match your search." : "No balances yet."}
          columns={[
            { key: "user", label: "Customer", render: b => {
              const u = store.users.find(x => x.id === b.userId);
              return (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {u?.name.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{u?.name ?? ""}</div>
                    <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{u?.email ?? b.userId}</div>
                  </div>
                </div>
              );
            }},
            { key: "usd", label: "Available", align: "right", render: b => (
              <span className="mono font-semibold" style={{ color: "var(--green)" }}>{formatCurrency(b.usd)}</span>
            )},
            { key: "locked", label: "Locked", align: "right", render: b => (
              <span className="mono" style={{ color: b.locked > 0 ? "var(--amber)" : "var(--muted)" }}>{formatCurrency(b.locked)}</span>
            )},
            { key: "total", label: "Total", align: "right", render: b => (
              <span className="mono font-semibold">{formatCurrency(b.usd + b.locked)}</span>
            )},
            { key: "updated", label: "Updated", align: "right", render: b => (
              <span className="text-xs" style={{ color: "var(--muted)" }}><LiveTimeAgo ts={b.updatedAt} /></span>
            )},
            { key: "act", label: "", align: "right", render: b => (
              <Btn kind="ghost" size="sm" onClick={() => startEdit(b)}>Edit</Btn>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={close} title="Edit balance"
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save changes</Btn></>}>
        {editing && original && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
              {(() => {
                const u = store.users.find(x => x.id === editing.userId);
                return (
                  <>
                    <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                      {u?.name.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{u?.name ?? ""}</div>
                      <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{u?.email ?? editing.userId}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                <div className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted)" }}>Current</div>
                <div className="space-y-2.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Available</div>
                    <div className="mono text-lg font-bold" style={{ color: "var(--green)" }}>{formatCurrency(original.usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Locked</div>
                    <div className="mono text-lg font-bold" style={{ color: original.locked > 0 ? "var(--amber)" : "var(--muted)" }}>
                      {formatCurrency(original.locked)}
                    </div>
                  </div>
                  <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Total</div>
                    <div className="mono text-lg font-bold">{formatCurrency(original.usd + original.locked)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4"
                style={{
                  background: delta && delta.changed ? "linear-gradient(135deg, rgba(124,143,245,0.10), rgba(124,143,245,0.02))" : "var(--panel-2)",
                  border: "1px solid " + (delta && delta.changed ? "var(--accent)" : "var(--border)"),
                }}>
                <div className="text-[10px] uppercase tracking-wider font-semibold mb-3"
                  style={{ color: delta && delta.changed ? "var(--accent)" : "var(--muted)" }}>New</div>
                <div className="space-y-2.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Available</div>
                    <div className="mono text-lg font-bold" style={{ color: "var(--green)" }}>{formatCurrency(editing.usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Locked</div>
                    <div className="mono text-lg font-bold" style={{ color: editing.locked > 0 ? "var(--amber)" : "var(--muted)" }}>
                      {formatCurrency(editing.locked)}
                    </div>
                  </div>
                  <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Total</div>
                    <div className="mono text-lg font-bold">{formatCurrency(editing.usd + editing.locked)}</div>
                  </div>
                </div>
              </div>
            </div>

            {delta && delta.changed && (
              <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
                style={{
                  background: delta.dTotal >= 0 ? "rgba(63,185,80,0.10)" : "rgba(248,81,73,0.10)",
                  border: "1px solid " + (delta.dTotal >= 0 ? "var(--green)" : "var(--red)"),
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: delta.dTotal >= 0 ? "var(--green)" : "var(--red)", color: "#0a0b0f" }}>
                    {delta.dTotal >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: delta.dTotal >= 0 ? "var(--green)" : "var(--red)" }}>Total change</div>
                    <div className="text-xl font-bold mono"
                      style={{ color: delta.dTotal >= 0 ? "var(--green)" : "var(--red)" }}>
                      {delta.dTotal >= 0 ? "+" : ""}{formatCurrency(delta.dTotal)}
                    </div>
                  </div>
                </div>
                <div className="text-xs space-y-0.5 text-right" style={{ color: "var(--muted)" }}>
                  {Math.abs(delta.dUsd) > 0.001 && (
                    <div>Available: <strong className="mono" style={{ color: delta.dUsd >= 0 ? "var(--green)" : "var(--red)" }}>{delta.dUsd >= 0 ? "+" : ""}{formatCurrency(delta.dUsd)}</strong></div>
                  )}
                  {Math.abs(delta.dLocked) > 0.001 && (
                    <div>Locked: <strong className="mono" style={{ color: delta.dLocked >= 0 ? "var(--green)" : "var(--red)" }}>{delta.dLocked >= 0 ? "+" : ""}{formatCurrency(delta.dLocked)}</strong></div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Available (USD-equivalent)">
                <Input value={editing.usd} onChange={v => setField("usd", parseFloat(v) || 0)} type="number" />
              </Field>
              <Field label="Locked (USD-equivalent)">
                <Input value={editing.locked} onChange={v => setField("locked", parseFloat(v) || 0)} type="number" />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-[11px] uppercase tracking-wider self-center mr-1" style={{ color: "var(--muted)" }}>Quick adjust:</span>
              {[-1000, -100, -10, +10, +100, +1000].map(d => (
                <button key={d} type="button" onClick={() => setField("usd", Math.max(0, editing.usd + d))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                  style={{
                    background: d >= 0 ? "var(--green-dim)" : "var(--red-dim)",
                    color: d >= 0 ? "var(--green)" : "var(--red)",
                    border: "1px solid " + (d >= 0 ? "var(--green)" : "var(--red)"),
                  }}>
                  {d >= 0 ? "+" : ""}{formatCurrency(Math.abs(d))}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2 text-xs rounded-xl p-3"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              <Info size={13} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>Last updated: <LiveTimeAgo ts={original.updatedAt} />  Original total: <span className="mono">{formatCurrency(original.usd + original.locked)}</span></div>
                <div className="mt-1 text-[11px]">Every change is recorded in the <strong>Audit Log</strong>.</div>
              </div>
              {delta && delta.changed && (
                <button type="button" onClick={reset}
                  className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md"
                  style={{ background: "var(--red-dim)", color: "var(--red)" }}>
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}