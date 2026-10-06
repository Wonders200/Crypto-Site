"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminNews, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Textarea, Toggle, Badge, Kpi } from "@/components/admin/ui";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Trash2, Pin, PinOff, Zap, RefreshCw } from "lucide-react";

const empty = (): AdminNews => ({
  id: "", title: "", source: "", summary: "",
  publishedAt: Date.now(), featured: false, enabled: true,
  pinned: false, origin: "manual",
});

export default function AdminNewsPage() {
  const { store, update, log, refreshNews } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminNews | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => { setEditing(empty()); setIsNew(true); };
  const startEdit = (n: AdminNews) => { setEditing({ ...n }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.title || !editing.summary) {
      push({ kind: "error", title: "Title and summary required" });
      return;
    }
    if (isNew) {
      const n = { ...editing, id: editing.id || uid("n"), origin: "manual" as const };
      update("news", [n, ...store.news]);
      log("CREATE", "News: " + n.title.slice(0, 40), n.source);
      push({ kind: "success", title: "Article published" });
    } else {
      update("news", store.news.map(x => (x.id === editing.id ? editing : x)));
      log("UPDATE", "News: " + editing.title.slice(0, 40));
      push({ kind: "success", title: "Article updated" });
    }
    close();
  };

  const remove = (n: AdminNews) => {
    if (!confirm("Delete " + n.title + "?")) return;
    update("news", store.news.filter(x => x.id !== n.id));
    log("DELETE", "News: " + n.title.slice(0, 40));
    push({ kind: "success", title: "Article deleted" });
  };

  const togglePin = (n: AdminNews) => {
    update("news", store.news.map(x => (x.id === n.id ? { ...x, pinned: !x.pinned } : x)));
    log(n.pinned ? "UNPIN" : "PIN", "News: " + n.title.slice(0, 40));
  };

  const toggleEnabled = (n: AdminNews) => {
    update("news", store.news.map(x => (x.id === n.id ? { ...x, enabled: !x.enabled } : x)));
    log(n.enabled ? "DISABLE" : "ENABLE", "News: " + n.title.slice(0, 40));
  };

  const doRefresh = (force: boolean) => {
    const added = refreshNews({ force });
    if (added > 0) push({ kind: "success", title: "Added " + added + " fresh articles" });
    else push({ kind: "info", title: "No new articles" });
  };

  const setMeta = (k: string, v: any) => {
    update("newsMeta", { ...store.newsMeta, [k]: v });
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  const pinned = store.news.filter(n => n.pinned).length;
  const manual = store.news.filter(n => n.origin === "manual").length;
  const auto = store.news.filter(n => n.origin === "auto").length;

  return (
    <div>
      <PageHeader
        title="News"
        subtitle={store.news.length + " articles  " + pinned + " pinned  " + manual + " editorial  " + auto + " auto"}
        actions={
          <div className="flex gap-2">
            <Btn kind="ghost" onClick={() => doRefresh(false)}><RefreshCw size={14} /> Check auto-refresh</Btn>
            <Btn kind="success" onClick={() => doRefresh(true)}><Zap size={14} /> Generate fresh now</Btn>
            <Btn onClick={startNew}>+ New Article</Btn>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Kpi label="Total articles" value={String(store.news.length)} />
        <Kpi label="Editorial" value={String(manual)} />
        <Kpi label="Auto-generated" value={String(auto)} />
      </div>

      <Panel title="Automation" padded>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <Toggle checked={store.newsMeta.autoRefresh} onChange={v => setMeta("autoRefresh", v)} label="Auto-refresh enabled" />
          </div>
          <Field label="Refresh interval (hours)">
            <Input value={store.newsMeta.refreshIntervalHours} onChange={v => setMeta("refreshIntervalHours", Math.max(1, parseInt(v) || 24))} type="number" />
          </Field>
          <Field label="Max articles kept">
            <Input value={store.newsMeta.maxArticles} onChange={v => setMeta("maxArticles", Math.max(10, parseInt(v) || 60))} type="number" />
          </Field>
        </div>
        <div className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
          Last refreshed: {store.newsMeta.lastRefresh ? <LiveTimeAgo ts={store.newsMeta.lastRefresh} /> : "never"}
        </div>
      </Panel>

      <div className="mt-6">
        <Panel padded={false}>
          <DataTable<AdminNews>
            keyFn={n => n.id}
            rows={store.news}
            empty="No articles yet."
            columns={[
              { key: "pin", label: "", align: "center", render: n => (
                <button onClick={() => togglePin(n)} className="hover:scale-110 transition" title={n.pinned ? "Unpin" : "Pin"}>
                  {n.pinned ? <Pin size={14} fill="var(--amber)" stroke="var(--amber)" /> : <PinOff size={14} stroke="var(--muted-2)" />}
                </button>
              )},
              { key: "title", label: "Title", render: n => (
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{n.summary.slice(0, 90)}</div>
                </div>
              )},
              { key: "origin", label: "Origin", align: "center", render: n => (
                <Badge kind={n.origin === "manual" ? "amber" : "gray"}>{n.origin === "manual" ? "EDITORIAL" : "AUTO"}</Badge>
              )},
              { key: "source", label: "Source", render: n => <Badge kind="blue">{n.source}</Badge> },
              { key: "feat", label: "Featured", align: "center", render: n => n.featured ? <Badge kind="amber"></Badge> : <span style={{ color: "var(--muted-2)" }}></span> },
              { key: "status", label: "Status", align: "center", render: n => (
                <button onClick={() => toggleEnabled(n)} className="hover:opacity-80">
                  <Badge kind={n.enabled ? "green" : "gray"}>{n.enabled ? "LIVE" : "OFF"}</Badge>
                </button>
              )},
              { key: "at", label: "Published", align: "right", render: n => (
                <span className="text-xs" style={{ color: "var(--muted)" }}><LiveTimeAgo ts={n.publishedAt} /></span>
              )},
              { key: "act", label: "", align: "right", render: n => (
                <div className="flex justify-end gap-1.5">
                  <Btn kind="ghost" size="sm" onClick={() => startEdit(n)}>Edit</Btn>
                  <Btn kind="danger" size="sm" onClick={() => remove(n)}><Trash2 size={11} /> Delete</Btn>
                </div>
              )},
            ]}
          />
        </Panel>
      </div>

      <Modal open={!!editing} onClose={close} title={isNew ? "New Article" : "Edit Article"}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Title"><Input value={editing.title} onChange={v => setField("title", v)} /></Field>
            <Field label="Source"><Input value={editing.source} onChange={v => setField("source", v)} placeholder="CoinDesk" /></Field>
            <Field label="Summary"><Textarea value={editing.summary} onChange={v => setField("summary", v)} rows={4} /></Field>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={editing.featured} onChange={v => setField("featured", v)} label="Featured" />
              <Toggle checked={editing.enabled} onChange={v => setField("enabled", v)} label="Published" />
              <Toggle checked={editing.pinned} onChange={v => setField("pinned", v)} label="Pin (never auto-remove)" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
