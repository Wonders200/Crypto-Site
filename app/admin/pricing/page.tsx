"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminPricingTier, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Textarea, Toggle, Badge } from "@/components/admin/ui";
import { Trash2 } from "lucide-react";

const empty = (): AdminPricingTier => ({
  id: "", name: "", volume: "", maker: "0.10%", taker: "0.20%",
  features: [], cta: "Get started", highlight: false, enabled: true,
});

export default function AdminPricingPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminPricingTier | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const list = store.pricingTiers ?? [];

  const startNew = () => { setEditing(empty()); setFeaturesText(""); setIsNew(true); };
  const startEdit = (t: AdminPricingTier) => { setEditing({ ...t }); setFeaturesText(t.features.join("\n")); setIsNew(false); };
  const close = () => { setEditing(null); setFeaturesText(""); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.name) {
      push({ kind: "error", title: "Name required" });
      return;
    }
    const features = featuresText.split("\n").map(s => s.trim()).filter(Boolean);
    const next = { ...editing, features };
    if (isNew) {
      const t = { ...next, id: editing.id || uid("p") };
      update("pricingTiers", [...list, t]);
      log("CREATE", `Pricing tier: ${t.name}`);
    } else {
      update("pricingTiers", list.map(x => (x.id === editing.id ? next : x)));
      log("UPDATE", `Pricing tier: ${next.name}`);
    }
    push({ kind: "success", title: "Saved" });
    close();
  };

  const remove = (t: AdminPricingTier) => {
    if (!confirm(`Delete "${t.name}" tier?`)) return;
    update("pricingTiers", list.filter(x => x.id !== t.id));
    log("DELETE", `Pricing tier: ${t.name}`);
    push({ kind: "success", title: "Deleted" });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Pricing Tiers"
        subtitle={`${list.length} tiers  ${list.filter(t => t.enabled).length} live`}
        actions={<Btn onClick={startNew}>+ New Tier</Btn>}
      />
      <Panel padded={false}>
        <DataTable<AdminPricingTier>
          keyFn={t => t.id}
          rows={list}
          empty="No pricing tiers yet."
          columns={[
            { key: "name", label: "Tier", render: t => (
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{t.volume}</div>
              </div>
            )},
            { key: "maker", label: "Maker", align: "right", render: t => <span className="mono">{t.maker}</span> },
            { key: "taker", label: "Taker", align: "right", render: t => <span className="mono">{t.taker}</span> },
            { key: "features", label: "Features", render: t => <span className="text-xs" style={{ color: "var(--muted)" }}>{t.features.length} items</span> },
            { key: "hl", label: "Highlight", align: "center", render: t => t.highlight ? <Badge kind="green"></Badge> : <span style={{ color: "var(--muted-2)" }}></span> },
            { key: "status", label: "Status", align: "center", render: t => <Badge kind={t.enabled ? "green" : "gray"}>{t.enabled ? "LIVE" : "OFF"}</Badge> },
            { key: "act", label: "", align: "right", render: t => (
              <div className="flex justify-end gap-1.5">
                <Btn kind="ghost" size="sm" onClick={() => startEdit(t)}>Edit</Btn>
                <Btn kind="danger" size="sm" onClick={() => remove(t)} title="Delete"><Trash2 size={11} /> Delete</Btn>
              </div>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={close}
        title={isNew ? "New Pricing Tier" : `Edit ${editing?.name ?? ""}`}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name"><Input value={editing.name} onChange={v => setField("name", v)} /></Field>
              <Field label="Volume range"><Input value={editing.volume} onChange={v => setField("volume", v)} placeholder="$0  $10k / mo" /></Field>
              <Field label="Maker fee"><Input value={editing.maker} onChange={v => setField("maker", v)} /></Field>
              <Field label="Taker fee"><Input value={editing.taker} onChange={v => setField("taker", v)} /></Field>
              <Field label="CTA text"><Input value={editing.cta} onChange={v => setField("cta", v)} /></Field>
            </div>
            <Field label="Features (one per line)">
              <Textarea value={featuresText} onChange={setFeaturesText} rows={5} />
            </Field>
            <Toggle checked={editing.highlight} onChange={v => setField("highlight", v)} label="Highlight (Most popular)" />
          </div>
        )}
      </Modal>
    </div>
  );
}