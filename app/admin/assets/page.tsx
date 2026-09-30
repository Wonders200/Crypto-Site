"use client";
import CoinIcon from "@/components/CoinIcon";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminCoin, uid, Category, Risk } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Select, Toggle, Badge } from "@/components/admin/ui";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Trash2 } from "lucide-react";

const CATEGORIES: Category[] = ["Layer 1", "Layer 2", "DeFi", "Stablecoin", "Meme", "Infra", "Exchange"];

const empty = (): AdminCoin => ({
  id: "",
  symbol: "",
  name: "",
  price: 0,
  change24h: 0,
  change7d: 0,
  marketCap: 0,
  volume24h: 0,
  circulating: 0,
  category: "Layer 1",
  risk: 3,
  color: "#5b7cfa",
  featured: false,
  enabled: true,
});

export default function AdminAssetsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminCoin | null>(null);
  const [isNew, setIsNew] = useState(false);

  const coins = store.coins ?? [];

  const startNew = () => { setEditing(empty()); setIsNew(true); };
  const startEdit = (c: AdminCoin) => { setEditing({ ...c }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing) return;
    if (!editing.symbol || !editing.name || editing.price <= 0) {
      push({ kind: "error", title: "Missing fields", message: "Symbol, name and price are required." });
      return;
    }
    if (isNew) {
      const c = { ...editing, id: editing.id || editing.symbol.toLowerCase() };
      if (coins.some(x => x.id === c.id)) {
        push({ kind: "error", title: "Duplicate ID" });
        return;
      }
      update("coins", [...coins, c]);
      log("CREATE", `Asset: ${c.symbol}`, c.name);
      push({ kind: "success", title: "Asset added", message: `${c.symbol} is now live.` });
    } else {
      update("coins", coins.map(c => (c.id === editing.id ? editing : c)));
      log("UPDATE", `Asset: ${editing.symbol}`, editing.name);
      push({ kind: "success", title: "Asset updated" });
    }
    close();
  };

  const remove = (c: AdminCoin) => {
    if (!confirm(`Delete ${c.symbol}?`)) return;
    update("coins", coins.filter(x => x.id !== c.id));
    log("DELETE", `Asset: ${c.symbol}`, c.name);
    push({ kind: "success", title: "Asset deleted" });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle={`${coins.length} assets  ${coins.filter(c => c.enabled).length} live`}
        actions={<Btn onClick={startNew}>+ Add Asset</Btn>}
      />

      <Panel padded={false}>
        <DataTable<AdminCoin>
          keyFn={c => c.id}
          rows={coins}
          empty="No assets yet."
          columns={[
            { key: "symbol", label: "Symbol", render: c => (
              <div className="flex items-center gap-3">
                <CoinIcon symbol={c.symbol} color={c.color} size={32} />
                <div>
                  <div className="font-semibold">{c.symbol}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{c.name}</div>
                </div>
              </div>
            )},
            { key: "price", label: "Price", align: "right", render: c => <span className="mono">{formatCurrency(c.price)}</span> },
            { key: "change", label: "24h", align: "right", render: c => (
              <span className="mono" style={{ color: c.change24h >= 0 ? "var(--green)" : "var(--red)" }}>
                {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
              </span>
            )},
            { key: "mcap", label: "M.Cap", align: "right", render: c => <span className="mono">{formatCompact(c.marketCap)}</span> },
            { key: "cat", label: "Category", render: c => <Badge kind="gray">{c.category}</Badge> },
            { key: "risk", label: "Risk", align: "center", render: c => (
              <Badge kind={c.risk <= 2 ? "green" : c.risk === 3 ? "blue" : c.risk === 4 ? "amber" : "red"}>
                R{c.risk}
              </Badge>
            )},
            { key: "feat", label: "Feat", align: "center", render: c => c.featured ? <Badge kind="amber"></Badge> : <span style={{ color: "var(--muted-2)" }}></span> },
            { key: "en", label: "Status", align: "center", render: c => (
              <Badge kind={c.enabled ? "green" : "red"}>{c.enabled ? "LIVE" : "OFF"}</Badge>
            )},
            { key: "act", label: "", align: "right", render: c => (
              <div className="flex justify-end gap-1.5">
                <Btn kind="ghost" size="sm" onClick={() => startEdit(c)}>Edit</Btn>
                <Btn kind="danger" size="sm" onClick={() => remove(c)} title="Delete"><Trash2 size={11} /> Delete</Btn>
              </div>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={close}
        title={isNew ? "Add Asset" : `Edit ${editing?.symbol ?? ""}`}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID"><Input value={editing.id} onChange={v => setField("id", v)} placeholder="bitcoin" /></Field>
            <Field label="Symbol"><Input value={editing.symbol} onChange={v => setField("symbol", v.toUpperCase())} placeholder="BTC" /></Field>
            <Field label="Name"><Input value={editing.name} onChange={v => setField("name", v)} placeholder="Bitcoin" /></Field>
            <Field label="Price (USD)"><Input value={editing.price} onChange={v => setField("price", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="24h change %"><Input value={editing.change24h} onChange={v => setField("change24h", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="7d change %"><Input value={editing.change7d} onChange={v => setField("change7d", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Market cap"><Input value={editing.marketCap} onChange={v => setField("marketCap", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Volume 24h"><Input value={editing.volume24h} onChange={v => setField("volume24h", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Circulating"><Input value={editing.circulating} onChange={v => setField("circulating", parseFloat(v) || 0)} type="number" /></Field>
            <Field label="Category">
              <Select value={editing.category} onChange={v => setField("category", v as Category)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} />
            </Field>
            <Field label="Risk (1-5)">
              <Select value={String(editing.risk)} onChange={v => setField("risk", parseInt(v) as Risk)}
                options={[1, 2, 3, 4, 5].map(r => ({ value: String(r), label: `Level ${r}` }))} />
            </Field>
            <Field label="Color"><Input value={editing.color} onChange={v => setField("color", v)} placeholder="#f7931a" /></Field>
            <div className="col-span-2 flex gap-6 pt-2">
              <Toggle checked={editing.featured} onChange={v => setField("featured", v)} label="Feature on home" />
              <Toggle checked={editing.enabled} onChange={v => setField("enabled", v)} label="Listed publicly" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}