"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { PageHeader, Btn, Panel, Badge } from "@/components/admin/ui";
import LiveDate from "@/components/LiveDate";
import { Search, ScrollText, Trash2 } from "lucide-react";

export default function AdminAuditPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (store.audit ?? [])
      .filter(e => {
        if (!term) return true;
        return e.action.toLowerCase().includes(term)
          || e.target.toLowerCase().includes(term)
          || (e.details ?? "").toLowerCase().includes(term)
          || e.actor.toLowerCase().includes(term);
      })
      .sort((a, b) => b.at - a.at);
  }, [store.audit, q]);

  const clearLog = () => {
    if (!confirm("Clear the entire audit log? This cannot be undone.")) return;
    update("audit", []);
    push({ kind: "success", title: "Audit log cleared" });
  };

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={`${(store.audit ?? []).length} entries (most recent first, max 500)`}
        actions={(store.audit ?? []).length > 0 ? (
          <Btn kind="danger" onClick={clearLog}><Trash2 size={12} /> Clear log</Btn>
        ) : undefined}
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by action, target, actor, or details"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      <Panel padded={false}>
        {entries.length === 0 ? (
          <div className="p-16 text-center">
            <ScrollText size={26} style={{ color: "var(--muted)", margin: "0 auto" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              {q ? "No entries match your search." : "No activity yet  admin actions will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {entries.map(a => (
              <div key={a.id} className="px-5 py-3 border-b flex items-center gap-4 text-sm" style={{ borderColor: "var(--border)" }}>
                <Badge kind={
                  a.action.includes("DELETE") || a.action.includes("REJECT") ? "red"
                  : a.action.includes("CREATE") || a.action.includes("APPROVE") || a.action.includes("LOGIN") ? "green"
                  : a.action.includes("UPDATE") || a.action.includes("EDIT") ? "blue"
                  : "gray"
                }>
                  {a.action}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{a.target}</div>
                  {a.details && <div className="truncate text-xs" style={{ color: "var(--muted)" }}>{a.details}</div>}
                </div>
                <span className="text-xs mono shrink-0" style={{ color: "var(--muted)" }}>{a.actor}</span>
                <span className="text-xs shrink-0" style={{ color: "var(--muted-2)" }}>
                  <LiveDate ts={a.at} mode="datetime" />
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}