"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminEarnProduct, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Select, Toggle, Badge } from "@/components/admin/ui";
import { Trash2 } from "lucide-react";

const empty = (): AdminEarnProduct => ({
  id: "",
  asset: "",
  apy: 0,
  tier: "Flexible",
  lockup: "None",
  min: "$100",
  risk: "Low",
  color: "#5b7cfa",
  enabled: true,
});

export default function AdminEarnPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminEarnProduct | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = store.earnProducts ?? [];

  const startNew = () => {
    setEditing(empty());
    setIsNew(true);
  };

  const startEdit = (p: AdminEarnProduct) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.asset || editing.apy <= 0) {
      push({ kind: "error", title: "Asset and APY required" });
      return;
    }
    if (isNew) {
      const p = { ...editing, id: editing.id || uid("e") };
      update("earnProducts", [...list, p]);
      log("CREATE", `Earn product: ${p.asset}`, `${p.apy}% APY`);
      push({ kind: "success", title: "Product added" });
    } else {
      update("earnProducts", list.map(x => (x.id === editing.id ? editing : x)));
      log("UPDATE", `Earn product: ${editing.asset}`, `${editing.apy}% APY`);
      push({ kind: "success", title: "Product updated" });
    }
    close();
  };

  const remove = (p: AdminEarnProduct) => {
    if (!confirm(`Delete ${p.asset} product?`)) return;
    update("earnProducts", list.filter(x => x.id !== p.id));
    log("DELETE", `Earn product: ${p.asset}`);
    push({ kind: "success", title: "Product deleted" });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Earn Products"
        subtitle={`${list.length} products  ${list.filter(p => p.enabled).length} live`}
        actions={<Btn onClick={startNew}>+ New Product</Btn>}
      />

      <Panel padded={false}>
        <DataTable<AdminEarnProduct>
          keyFn={p => p.id}
          rows={list}
          empty="No earn products yet."
          columns={[
            {
              key: "asset",
              label: "Asset",
              render: p => (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ background: p.color }}
                  >
                    {p.asset.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-semibold">{p.asset}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{p.tier}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "apy",
              label: "APY",
              align: "right",
              render: p => (
                <span className="mono font-semibold" style={{ color: "var(--green)" }}>
                  {p.apy.toFixed(2)}%
                </span>
              ),
            },
            {
              key: "lockup",
              label: "Lockup",
              render: p => <span className="text-xs">{p.lockup}</span>,
            },
            {
              key: "min",
              label: "Min",
              align: "right",
              render: p => <span className="mono text-xs">{p.min}</span>,
            },
            {
              key: "risk",
              label: "Risk",
              align: "center",
              render: p => (
                <Badge kind={p.risk === "Low" ? "green" : p.risk === "Med" ? "blue" : "amber"}>
                  {p.risk}
                </Badge>
              ),
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: p => (
                <Badge kind={p.enabled ? "green" : "gray"}>
                  {p.enabled ? "LIVE" : "OFF"}
                </Badge>
              ),
            },
            {
              key: "act",
              label: "",
              align: "right",
              render: p => (
                <div className="flex justify-end gap-1.5">
                  <Btn kind="ghost" size="sm" onClick={() => startEdit(p)}>Edit</Btn>
                  <Btn kind="danger" size="sm" onClick={() => remove(p)} title="Delete">
                    <Trash2 size={11} /> Delete
                  </Btn>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? "New Earn Product" : `Edit ${editing?.asset ?? ""}`}
        footer={
          <>
            <Btn kind="ghost" onClick={close}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset">
              <Input value={editing.asset} onChange={v => setField("asset", v.toUpperCase())} />
            </Field>
            <Field label="APY %">
              <Input
                value={editing.apy}
                onChange={v => setField("apy", parseFloat(v) || 0)}
                type="number"
              />
            </Field>
            <Field label="Tier">
              <Input value={editing.tier} onChange={v => setField("tier", v)} placeholder="Flexible / Staking" />
            </Field>
            <Field label="Lockup">
              <Input value={editing.lockup} onChange={v => setField("lockup", v)} placeholder="None / 2 days" />
            </Field>
            <Field label="Minimum">
              <Input value={editing.min} onChange={v => setField("min", v)} />
            </Field>
            <Field label="Risk">
              <Select
                value={editing.risk}
                onChange={v => setField("risk", v as AdminEarnProduct["risk"])}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Med", label: "Med" },
                  { value: "High", label: "High" },
                ]}
              />
            </Field>
            <Field label="Color">
              <Input value={editing.color} onChange={v => setField("color", v)} />
            </Field>
            <div className="col-span-2">
              <Toggle
                checked={editing.enabled}
                onChange={v => setField("enabled", v)}
                label="Visible"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}