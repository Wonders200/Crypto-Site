"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminLearnTopic, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Textarea, Toggle, Badge } from "@/components/admin/ui";
import { Trash2 } from "lucide-react";

const empty = (): AdminLearnTopic => ({
  id: "",
  icon: "",
  title: "",
  desc: "",
  order: 0,
  enabled: true,
});

export default function AdminLearnPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminLearnTopic | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = [...(store.learnTopics ?? [])].sort((a, b) => a.order - b.order);

  const startNew = () => {
    setEditing({ ...empty(), order: list.length + 1 });
    setIsNew(true);
  };

  const startEdit = (t: AdminLearnTopic) => {
    setEditing({ ...t });
    setIsNew(false);
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.title) {
      push({ kind: "error", title: "Title required" });
      return;
    }
    if (isNew) {
      const t = { ...editing, id: editing.id || uid("l") };
      update("learnTopics", [...list, t].sort((x, y) => x.order - y.order));
      log("CREATE", `Learn topic: ${t.title}`);
      push({ kind: "success", title: "Topic added" });
    } else {
      update("learnTopics", list.map(x => (x.id === editing.id ? editing : x)).sort((x, y) => x.order - y.order));
      log("UPDATE", `Learn topic: ${editing.title}`);
      push({ kind: "success", title: "Topic updated" });
    }
    close();
  };

  const remove = (t: AdminLearnTopic) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    update("learnTopics", list.filter(x => x.id !== t.id));
    log("DELETE", `Learn topic: ${t.title}`);
    push({ kind: "success", title: "Topic deleted" });
  };

  const toggleEnabled = (t: AdminLearnTopic) => {
    update("learnTopics", list.map(x => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)));
    log(t.enabled ? "DISABLE" : "ENABLE", `Learn topic: ${t.title}`);
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Learn Topics"
        subtitle={`${list.length} topics  ${list.filter(t => t.enabled).length} live`}
        actions={<Btn onClick={startNew}>+ New Topic</Btn>}
      />

      <Panel padded={false}>
        <DataTable<AdminLearnTopic>
          keyFn={t => t.id}
          rows={list}
          empty="No topics yet. Click + New Topic."
          columns={[
            {
              key: "order",
              label: "#",
              render: t => <span className="mono text-xs" style={{ color: "var(--muted)" }}>{t.order}</span>,
            },
            {
              key: "icon",
              label: "",
              render: t => <span className="text-2xl">{t.icon}</span>,
            },
            {
              key: "title",
              label: "Title",
              render: t => (
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {t.desc.slice(0, 80)}
                    {t.desc.length > 80 ? "" : ""}
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: t => (
                <button onClick={() => toggleEnabled(t)} className="hover:opacity-80">
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

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? "New Topic" : "Edit Topic"}
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
              <Field label="Icon (emoji)">
                <Input value={editing.icon} onChange={v => setField("icon", v)} />
              </Field>
              <Field label="Order">
                <Input value={editing.order} onChange={v => setField("order", parseInt(v) || 0)} type="number" />
              </Field>
            </div>

            <Field label="Title">
              <Input value={editing.title} onChange={v => setField("title", v)} />
            </Field>

            <Field label="Description">
              <Textarea value={editing.desc} onChange={v => setField("desc", v)} rows={3} />
            </Field>

            <Toggle checked={editing.enabled} onChange={v => setField("enabled", v)} label="Visible" />
          </div>
        )}
      </Modal>
    </div>
  );
}
