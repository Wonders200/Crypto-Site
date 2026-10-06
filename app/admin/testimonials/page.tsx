"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminTestimonial, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Textarea, Select, Toggle, Badge } from "@/components/admin/ui";
import { Star, Trash2 } from "lucide-react";

const COLORS = ["#5b7cfa", "#00d18c", "#f5a623", "#b6509e", "#14f195", "#e84142", "#2775ca", "#ff7a00"];

const empty = (): AdminTestimonial => ({
  id: "",
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  avatarColor: "#5b7cfa",
  featured: false,
  enabled: true,
  order: 1,
});

export default function AdminTestimonialsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = [...(store.testimonials ?? [])].sort((a, b) => a.order - b.order);

  const startNew = () => {
    setEditing({ ...empty(), order: list.length + 1 });
    setIsNew(true);
  };

  const startEdit = (t: AdminTestimonial) => {
    setEditing({ ...t });
    setIsNew(false);
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name || !editing.quote) {
      push({ kind: "error", title: "Name and quote are required" });
      return;
    }
    if (isNew) {
      const t = { ...editing, id: editing.id || uid("tm") };
      update("testimonials", [...list, t].sort((x, y) => x.order - y.order));
      log("CREATE", `Testimonial: ${t.name}`, t.company);
      push({ kind: "success", title: "Testimonial added" });
    } else {
      update("testimonials", list.map(x => x.id === editing.id ? editing : x).sort((x, y) => x.order - y.order));
      log("UPDATE", `Testimonial: ${editing.name}`);
      push({ kind: "success", title: "Testimonial updated" });
    }
    close();
  };

  const remove = (t: AdminTestimonial) => {
    if (!confirm(`Delete testimonial from ${t.name}?`)) return;
    update("testimonials", list.filter(x => x.id !== t.id));
    log("DELETE", `Testimonial: ${t.name}`);
    push({ kind: "success", title: "Deleted" });
  };

  const toggle = (t: AdminTestimonial, key: "enabled" | "featured") => {
    update("testimonials", list.map(x => x.id === t.id ? { ...x, [key]: !x[key] } : x));
    log(
      key === "enabled" ? (t.enabled ? "DISABLE" : "ENABLE") : (t.featured ? "UNFEATURE" : "FEATURE"),
      `Testimonial: ${t.name}`
    );
  };

  const move = (t: AdminTestimonial, dir: -1 | 1) => {
    const idx = list.findIndex(x => x.id === t.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    const next = [...list];
    const tmp = next[idx];
    next[idx] = next[swap];
    next[swap] = tmp;
    update("testimonials", next.map((x, i) => ({ ...x, order: i + 1 })));
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle={`${list.length} total  ${list.filter(t => t.enabled).length} live  ${list.filter(t => t.featured).length} featured`}
        actions={<Btn onClick={startNew}>+ Add Testimonial</Btn>}
      />

      <Panel padded={false}>
        <DataTable<AdminTestimonial>
          keyFn={t => t.id}
          rows={list}
          empty="No testimonials yet. Click + Add Testimonial."
          columns={[
            {
              key: "order",
              label: "#",
              render: t => (
                <div className="flex items-center gap-1">
                  <button onClick={() => move(t, -1)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}></button>
                  <span className="mono text-xs">{t.order}</span>
                  <button onClick={() => move(t, 1)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}></button>
                </div>
              ),
            },
            {
              key: "person",
              label: "Person",
              render: t => (
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: t.avatarColor, color: "#0a0b0f" }}
                  >
                    {t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {t.role}{t.company ? `  ${t.company}` : ""}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "quote",
              label: "Quote",
              render: t => (
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {t.quote.slice(0, 80)}{t.quote.length > 80 ? "" : ""}
                </span>
              ),
            },
            {
              key: "rating",
              label: "Rating",
              align: "center",
              render: t => (
                <div className="flex gap-0.5 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={i < t.rating ? "var(--amber)" : "none"}
                      stroke={i < t.rating ? "var(--amber)" : "var(--muted-2)"}
                    />
                  ))}
                </div>
              ),
            },
            {
              key: "featured",
              label: "Featured",
              align: "center",
              render: t => (
                <button onClick={() => toggle(t, "featured")} className="hover:opacity-80">
                  <Badge kind={t.featured ? "amber" : "gray"}>{t.featured ? " YES" : ""}</Badge>
                </button>
              ),
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: t => (
                <button onClick={() => toggle(t, "enabled")} className="hover:opacity-80">
                  <Badge kind={t.enabled ? "green" : "gray"}>{t.enabled ? "LIVE" : "OFF"}</Badge>
                </button>
              ),
            },
            {
              key: "act",
              label: "",
              align: "right",
              render: t => (
                <div className="flex justify-end gap-1.5">
                  <Btn kind="ghost" size="sm" onClick={() => startEdit(t)}>Edit</Btn>
                  <Btn kind="danger" size="sm" onClick={() => remove(t)}>
                    <Trash2 size={11} /> Delete
                  </Btn>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
        <strong style={{ color: "var(--text)" }}>Display logic:</strong> On the home page,{" "}
        <em>featured</em> testimonials take priority. If none are featured, all enabled testimonials are shown.
        Disable an entry to hide it from the public site.
      </div>

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? "Add Testimonial" : `Edit ${editing?.name ?? ""}`}
        footer={
          <>
            <Btn kind="ghost" onClick={close}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={editing.name} onChange={v => setField("name", v)} placeholder="Sarah Chen" />
              </Field>
              <Field label="Role / Title">
                <Input value={editing.role} onChange={v => setField("role", v)} placeholder="Chief Investment Officer" />
              </Field>
              <Field label="Company (optional)">
                <Input value={editing.company} onChange={v => setField("company", v)} placeholder="Meridian Capital" />
              </Field>
              <Field label="Display order">
                <Input value={editing.order} onChange={v => setField("order", parseInt(v) || 1)} type="number" />
              </Field>
            </div>

            <Field label="Quote">
              <Textarea value={editing.quote} onChange={v => setField("quote", v)} rows={4} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Rating">
                <Select
                  value={String(editing.rating)}
                  onChange={v => setField("rating", parseInt(v))}
                  options={[1, 2, 3, 4, 5].map(n => ({
                    value: String(n),
                    label: `${"".repeat(n)}${"".repeat(5 - n)}`,
                  }))}
                />
              </Field>
              <Field label="Avatar color">
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setField("avatarColor", c)}
                      className="w-7 h-7 rounded-full transition"
                      style={{
                        background: c,
                        border: editing.avatarColor === c ? "2px solid var(--text)" : "2px solid transparent",
                      }}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <div className="flex gap-6 pt-1">
              <Toggle checked={editing.featured} onChange={v => setField("featured", v)} label="Featured on home page" />
              <Toggle checked={editing.enabled} onChange={v => setField("enabled", v)} label="Enabled" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
