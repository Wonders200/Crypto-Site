"use client";
import CoinIcon from "@/components/CoinIcon";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminOrder, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Select, Badge, Kpi } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Trash2, Check, X, Search, TrendingUp, TrendingDown, Clock, ListOrdered } from "lucide-react";

const empty = (): AdminOrder => ({
  id: "",
  userId: "",
  coinId: "",
  side: "buy",
  type: "market",
  amount: 0,
  price: 0,
  status: "pending",
  createdAt: Date.now(),
});

export default function AdminOrdersPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.orders
      .filter(o => statusFilter === "all" || o.status === statusFilter)
      .filter(o => {
        if (!term) return true;
        const u = store.users.find(x => x.id === o.userId);
        return o.id.toLowerCase().includes(term)
          || o.coinId.toLowerCase().includes(term)
          || (u?.email ?? "").toLowerCase().includes(term)
          || (u?.name ?? "").toLowerCase().includes(term);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [store.orders, store.users, statusFilter, q]);

  const totalOrders = store.orders.length;
  const pendingCount = store.orders.filter(o => o.status === "pending").length;
  const filledCount = store.orders.filter(o => o.status === "filled").length;
  const totalVolume = store.orders
    .filter(o => o.status === "filled")
    .reduce((s, o) => s + o.amount * o.price, 0);

  /* ---------- Actions ---------- */
  const startNew = () => {
    const o = empty();
    o.userId = store.users[0]?.id ?? "";
    o.coinId = store.coins[0]?.id ?? "";
    setEditing(o);
    setIsNew(true);
  };
  const startEdit = (o: AdminOrder) => { setEditing({ ...o }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.userId || !editing.coinId) {
      push({ kind: "error", title: "User and asset are required" });
      return;
    }
    if (isNew) {
      const o = { ...editing, id: editing.id || uid("o"), createdAt: Date.now() };
      update("orders", [o, ...store.orders]);
      log("CREATE", `Order ${o.id}`, `${o.side} ${o.amount} ${o.coinId}`);
      push({ kind: "success", title: "Order created" });
    } else {
      update("orders", store.orders.map(o => o.id === editing.id ? editing : o));
      log("UPDATE", `Order ${editing.id}`, `${editing.status}`);
      push({ kind: "success", title: "Order updated" });
    }
    close();
  };

  const remove = (o: AdminOrder) => {
    if (!confirm(`Delete order ${o.id}? This cannot be undone.`)) return;
    update("orders", store.orders.filter(x => x.id !== o.id));
    log("DELETE", `Order ${o.id}`, `${o.side} ${o.amount} ${o.coinId}`);
    push({ kind: "success", title: "Order deleted" });
  };

  const setStatus = (o: AdminOrder, status: AdminOrder["status"]) => {
    update("orders", store.orders.map(x => x.id === o.id ? { ...x, status } : x));
    log("ORDER_" + status.toUpperCase(), `Order ${o.id}`, `${o.side} ${o.amount} ${o.coinId}`);
    push({ kind: "success", title: `Marked ${status}` });
  };

  const setField = (k: string, v: any) => setEditing(prev => prev ? { ...prev, [k]: v } : prev);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${totalOrders} orders  ${pendingCount} pending  ${filledCount} filled`}
        actions={
          <div className="flex gap-2 items-center">
            <div className="w-44">
              <Select value={statusFilter} onChange={setStatusFilter} options={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "filled", label: "Filled" },
                { value: "cancelled", label: "Cancelled" },
              ]} />
            </div>
            <Btn onClick={startNew}>+ New Order</Btn>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total orders" value={String(totalOrders)} />
        <Kpi
          label="Pending"
          value={String(pendingCount)}
          tone={pendingCount > 0 ? "amber" : "default"}
          sub={pendingCount > 0 ? "Need attention" : "All processed"}
        />
        <Kpi label="Filled" value={String(filledCount)} tone="green" />
        <Kpi
          label="Filled volume"
          value={formatCurrency(totalVolume)}
          sub="Sum of filled orders"
        />
      </div>

      {/* Search */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by order ID, user, or asset"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      <Panel padded={false}>
        <DataTable<AdminOrder>
          keyFn={o => o.id}
          rows={filtered}
          empty={q ? "No orders match your search." : "No orders yet."}
          columns={[
            { key: "id", label: "Order", render: o => (
              <div>
                <div className="mono text-xs font-semibold">{o.id}</div>
                <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                  <LiveTimeAgo ts={o.createdAt} />
                </div>
              </div>
            )},
            { key: "user", label: "Customer", render: o => {
              const u = store.users.find(x => x.id === o.userId);
              return (
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{u?.name ?? ""}</div>
                  <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{u?.email ?? o.userId}</div>
                </div>
              );
            }},
            { key: "asset", label: "Asset", render: o => {
              const c = store.coins.find(x => x.id === o.coinId);
              return (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-black"
                    style={{ background: c?.color ?? "#5b7cfa" }}>
                    {c?.symbol.slice(0, 1) ?? "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{c?.symbol ?? o.coinId}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted)" }}>{c?.name ?? ""}</div>
                  </div>
                </div>
              );
            }},
            { key: "side", label: "Side", render: o => (
              <Badge kind={o.side === "buy" ? "green" : "red"}>
                {o.side === "buy" ? <TrendingUp size={10} className="inline mr-1" /> : <TrendingDown size={10} className="inline mr-1" />}
                {o.side.toUpperCase()}
              </Badge>
            )},
            { key: "type", label: "Type", render: o => (
              <span className="text-xs font-medium uppercase" style={{ color: "var(--muted)" }}>{o.type}</span>
            )},
            { key: "amount", label: "Amount", align: "right", render: o => (
              <span className="mono text-sm">{o.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
            )},
            { key: "price", label: "Price", align: "right", render: o => (
              <span className="mono text-sm">{formatCurrency(o.price)}</span>
            )},
            { key: "total", label: "Total", align: "right", render: o => (
              <span className="mono text-sm font-semibold">{formatCurrency(o.amount * o.price)}</span>
            )},
            { key: "status", label: "Status", align: "center", render: o => (
              <Badge kind={o.status === "filled" ? "green" : o.status === "pending" ? "amber" : "gray"}>
                {o.status}
              </Badge>
            )},
            { key: "act", label: "", align: "right", render: o => (
              <div className="flex justify-end gap-1.5">
                {o.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStatus(o, "filled")}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                      style={{ background: "var(--green)", color: "#0a0b0f" }}
                      title="Add order">
                      <Check size={11} />Add</button>
                    <button
                      type="button"
                      onClick={() => setStatus(o, "cancelled")}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                      style={{ background: "var(--panel-2)", border: "1px solid var(--border-2)", color: "var(--muted)" }}
                      title="Cancel order">
                      <X size={11} /> Cancel
                    </button>
                  </>
                )}
                <Btn kind="ghost" size="sm" onClick={() => startEdit(o)}>Edit</Btn>
                <button
                  type="button"
                  onClick={() => remove(o)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                  style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}
                  title="Delete order">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            )},
          ]}
        />
      </Panel>

      {/* ---------- Edit modal ---------- */}
      <Modal open={!!editing} onClose={close}
        title={isNew ? "New Order" : `Edit order ${editing?.id}`}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer">
              <Select value={editing.userId} onChange={v => setField("userId", v)}
                options={store.users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))} />
            </Field>
            <Field label="Asset">
              <Select value={editing.coinId} onChange={v => setField("coinId", v)}
                options={store.coins.map(c => ({ value: c.id, label: `${c.symbol}  ${c.name}` }))} />
            </Field>
            <Field label="Side">
              <Select value={editing.side} onChange={v => setField("side", v as AdminOrder["side"])} options={[
                { value: "buy", label: "Buy" },
                { value: "sell", label: "Sell" },
              ]} />
            </Field>
            <Field label="Order type">
              <Select value={editing.type} onChange={v => setField("type", v as AdminOrder["type"])} options={[
                { value: "market", label: "Market" },
                { value: "limit", label: "Limit" },
                { value: "stop", label: "Stop" },
              ]} />
            </Field>
            <Field label="Amount">
              <Input value={editing.amount} onChange={v => setField("amount", parseFloat(v) || 0)} type="number" />
            </Field>
            <Field label="Price (USD)">
              <Input value={editing.price} onChange={v => setField("price", parseFloat(v) || 0)} type="number" />
            </Field>
            <Field label="Status">
              <Select value={editing.status} onChange={v => setField("status", v as AdminOrder["status"])} options={[
                { value: "pending", label: "Pending" },
                { value: "filled", label: "Filled" },
                { value: "cancelled", label: "Cancelled" },
              ]} />
            </Field>
            <Field label="Order value">
              <div className="px-3 py-2.5 rounded-lg mono text-sm"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                {formatCurrency(editing.amount * editing.price)}
              </div>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}