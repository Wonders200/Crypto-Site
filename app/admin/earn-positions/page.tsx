"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminEarnPosition } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Select, Badge, Kpi } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import LiveDate from "@/components/LiveDate";
import { Trash2 } from "lucide-react";

export default function AdminEarnPositionsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminEarnPosition | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const positions = (store.earnPositions ?? [])
    .filter(p => statusFilter === "all" || p.status === statusFilter)
    .sort((a, b) => b.startedAt - a.startedAt);

  const totalPrincipal = (store.earnPositions ?? []).filter(p => p.status === "active").reduce((s, p) => s + p.amountUsd, 0);
  const totalAccrued = (store.earnPositions ?? []).reduce((s, p) => s + p.accrued, 0);
  const activeCount = (store.earnPositions ?? []).filter(p => p.status === "active").length;

  const setStatus = (p: AdminEarnPosition, status: AdminEarnPosition["status"]) => {
    update("earnPositions", (store.earnPositions ?? []).map(x => (x.id === p.id ? { ...x, status } : x)));
    log("EARN_" + status.toUpperCase(), `Position ${p.id}`, `${p.asset}  $${p.amountUsd}`);
    push({ kind: "success", title: `Marked ${status}` });
  };

  const remove = (p: AdminEarnPosition) => {
    if (!confirm("Delete this earn position?")) return;
    update("earnPositions", (store.earnPositions ?? []).filter(x => x.id !== p.id));
    log("DELETE", `Earn position ${p.id}`);
    push({ kind: "success", title: "Deleted" });
  };

  const save = () => {
    if (!editing) return;
    update("earnPositions", (store.earnPositions ?? []).map(x => (x.id === editing.id ? editing : x)));
    log("UPDATE", `Earn position ${editing.id}`, `${editing.asset}  $${editing.amountUsd}`);
    setEditing(null);
    push({ kind: "success", title: "Updated" });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Earn Positions"
        subtitle={`${activeCount} active  ${formatCurrency(totalPrincipal)} principal  ${formatCurrency(totalAccrued)} rewards accrued`}
        actions={
          <div className="w-44">
            <Select value={statusFilter} onChange={setStatusFilter} options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "withdrawn", label: "Withdrawn" },
              { value: "matured", label: "Matured" },
            ]} />
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total principal" value={formatCurrency(totalPrincipal)} tone="green" />
        <Kpi label="Rewards accrued" value={formatCurrency(totalAccrued)} tone="green" />
        <Kpi label="Active positions" value={String(activeCount)} />
        <Kpi label="Total positions" value={String((store.earnPositions ?? []).length)} />
      </div>

      <Panel padded={false}>
        <DataTable<AdminEarnPosition>
          keyFn={p => p.id}
          rows={positions}
          empty="No earn positions yet."
          columns={[
            { key: "user", label: "Customer", render: p => {
              const u = store.users.find(x => x.id === p.userId);
              return (
                <div>
                  <div className="font-semibold text-sm">{u?.name ?? p.userId}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{u?.email ?? ""}</div>
                </div>
              );
            }},
            { key: "asset", label: "Asset", render: p => <span className="font-semibold">{p.asset}</span> },
            { key: "apy", label: "APY", align: "right", render: p => <span className="mono" style={{ color: "var(--green)" }}>{p.apy.toFixed(2)}%</span> },
            { key: "principal", label: "Principal", align: "right", render: p => <span className="mono font-semibold">{formatCurrency(p.amountUsd)}</span> },
            { key: "accrued", label: "Accrued", align: "right", render: p => <span className="mono" style={{ color: "var(--green)" }}>+{formatCurrency(p.accrued)}</span> },
            { key: "started", label: "Started", align: "right", render: p => <span className="text-xs"><LiveDate ts={p.startedAt} mode="date" /></span> },
            { key: "status", label: "Status", align: "center", render: p => (
              <Badge kind={p.status === "active" ? "green" : p.status === "withdrawn" ? "gray" : "blue"}>{p.status}</Badge>
            )},
            { key: "act", label: "", align: "right", render: p => (
              <div className="flex justify-end gap-1.5">
                {p.status === "active" && <Btn kind="ghost" size="sm" onClick={() => setStatus(p, "matured")}>Mature</Btn>}
                <Btn kind="ghost" size="sm" onClick={() => setEditing({ ...p })}>Edit</Btn>
                <Btn kind="danger" size="sm" onClick={() => remove(p)} title="Delete"><Trash2 size={11} /> Delete</Btn>
              </div>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Earn Position"
        footer={<><Btn kind="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset"><Input value={editing.asset} onChange={v => setField("asset", v)} /></Field>
            <Field label="APY (%)"><Input value={editing.apy} onChange={v => setField("apy", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Principal (USD)"><Input value={editing.amountUsd} onChange={v => setField("amountUsd", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Accrued (USD)"><Input value={editing.accrued} onChange={v => setField("accrued", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Status">
              <Select value={editing.status} onChange={v => setField("status", v as AdminEarnPosition["status"])} options={[
                { value: "active", label: "Active" },
                { value: "withdrawn", label: "Withdrawn" },
                { value: "matured", label: "Matured" },
              ]} />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}