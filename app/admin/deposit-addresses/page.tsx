"use client";
import { useStatememo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminDepositAddress, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Textarea, Select, Toggle, Badge } from "@/components/admin/ui";
import { Trash2, Copy, Check } from "lucide-react";

const empty = (): AdminDepositAddress => ({
  id: "",
  label: "",
  asset: "",
  network: "",
  address: "",
  memo: "",
  notes: "",
  category: "crypto",
  enabled: true,
  order: 99,
});

export default function AdminDepositAddressesPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminDepositAddress | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const list = [...(store.depositAddresses ?? [])].sort((a, b) => a.order - b.order);

  const startNew = () => { setEditing({ ...empty(), order: list.length + 1 }); setIsNew(true); };
  const startEdit = (a: AdminDepositAddress) => { setEditing({ ...a }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.label || !editing.address) {
      push({ kind: "error", title: "Label and address are required" });
      return;
    }
    if (isNew) {
      const a = { ...editing, id: editing.id || uid("da") };
      update("depositAddresses", [...list, a].sort((x, y) => x.order - y.order));
      log("CREATE", "Deposit address: " + a.label, a.address.slice(0, 20) + "");
      push({ kind: "success", title: "Address added" });
    } else {
      update("depositAddresses", list.map(x => (x.id === editing.id ? editing : x)).sort((x, y) => x.order - y.order));
      log("UPDATE", "Deposit address: " + editing.label, editing.address.slice(0, 20) + "");
      push({ kind: "success", title: "Address updated" });
    }
    close();
  };

  const remove = (a: AdminDepositAddress) => {
    if (!confirm("Delete " + a.label + "?")) return;
    update("depositAddresses", list.filter(x => x.id !== a.id));
    log("DELETE", "Deposit address: " + a.label);
    push({ kind: "success", title: "Address deleted" });
  };

  const toggleEnabled = (a: AdminDepositAddress) => {
    update("depositAddresses", list.map(x => (x.id === a.id ? { ...x, enabled: !x.enabled } : x)));
    log(a.enabled ? "DISABLE" : "ENABLE", "Deposit address: " + a.label);
  };

  const copyAddress = async (a: AdminDepositAddress) => {
    try {
      await navigator.clipboard.writeText(a.address);
      setCopiedId(a.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Deposit Addresses"
        subtitle={list.length + " methods  " + list.filter(a => a.enabled).length + " enabled"}
        actions={<Btn onClick={startNew}>+ Add Address</Btn>}
      />

      <Panel padded={false}>
        <DataTable<AdminDepositAddress>
          keyFn={a => a.id}
          rows={list}
          empty="No deposit addresses yet."
          columns={[
            { key: "order", label: "#", render: a => <span className="mono text-xs" style={{ color: "var(--muted)" }}>{a.order}</span> },
            { key: "label", label: "Label", render: a => (
              <div>
                <div className="font-semibold">{a.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{a.asset}  {a.network}</div>
              </div>
            )},
            { key: "address", label: "Address", render: a => (
              <div className="flex items-center gap-2">
                <span className="mono text-xs truncate max-w-[280px]" title={a.address}>{a.address}</span>
                <button onClick={() => copyAddress(a)} title="Copy" className="shrink-0 hover:opacity-70">
                  {copiedId === a.id ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} style={{ color: "var(--muted)" }} />}
                </button>
              </div>
            )},
            { key: "cat", label: "Category", align: "center", render: a => <Badge kind={a.category === "crypto" ? "blue" : "amber"}>{a.category}</Badge> },
            { key: "status", label: "Status", align: "center", render: a => (
              <button onClick={() => toggleEnabled(a)} className="hover:opacity-80">
                <Badge kind={a.enabled ? "green" : "gray"}>{a.enabled ? "LIVE" : "OFF"}</Badge>
              </button>
            )},
            { key: "act", label: "", align: "right", render: a => (
              <div className="flex justify-end gap-1.5">
                <Btn kind="ghost" size="sm" onClick={() => startEdit(a)}>Edit</Btn>
                <Btn kind="danger" size="sm" onClick={() => remove(a)} title="Delete"><Trash2 size={11} /> Delete</Btn>
              </div>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={close}
        title={isNew ? "Add Deposit Address" : "Edit " + (editing?.label ?? "")}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Label"><Input value={editing.label} onChange={v => setField("label", v)} placeholder="Bitcoin" /></Field>
              <Field label="Asset"><Input value={editing.asset} onChange={v => setField("asset", v.toUpperCase())} placeholder="BTC" /></Field>
              <Field label="Network"><Input value={editing.network} onChange={v => setField("network", v)} placeholder="Bitcoin / TRC20 / ERC20" /></Field>
              <Field label="Order"><Input value={editing.order} onChange={v => setField("order", parseInt(v) || 0)} type="number" /></Field>
            </div>
            <Field label="Address"><Input value={editing.address} onChange={v => setField("address", v)} /></Field>
            <Field label="Memo (optional)"><Input value={editing.memo ?? ""} onChange={v => setField("memo", v)} /></Field>
            <Field label="Notes"><Textarea value={editing.notes ?? ""} onChange={v => setField("notes", v)} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <Select value={editing.category} onChange={v => setField("category", v as AdminDepositAddress["category"])}
                  options={[{ value: "crypto", label: "Crypto" }, { value: "fiat", label: "Fiat" }]} />
              </Field>
              <div className="flex items-end pb-1">
                <Toggle checked={editing.enabled} onChange={v => setField("enabled", v)} label="Enabled" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}