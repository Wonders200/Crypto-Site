"use client";
import { useState, useMemo } from "react";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { useAdminStore } from "@/app/providers";
import { PageHeader, Btn, Panel, Badge } from "@/components/admin/ui";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Search, Bell, Activity, Trash2, RefreshCw } from "lucide-react";

export default function AdminActivityPage() {
  const { feed, clear } = useRealtimeEvents();
  const { store } = useAdminStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "CUSTOMER_ACTION" | "ADMIN_ACTION" | "SESSION_CHANGED" | "STORE_CHANGED">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return feed
      .filter(ev => filter === "all" || ev.type === filter)
      .filter(ev => {
        if (!term) return true;
        return ev.summary.toLowerCase().includes(term)
          || (ev.actor ?? "").toLowerCase().includes(term);
      });
  }, [feed, q, filter]);

  return (
    <div>
      <PageHeader
        title="Live Activity"
        subtitle={`${feed.length} events in this session  ${store.audit.length} audit entries`}
        actions={feed.length > 0 ? (
          <Btn kind="danger" onClick={clear}><Trash2 size={12} /> Clear feed</Btn>
        ) : undefined}
      />

      <div className="panel p-4 mb-4 flex items-center gap-3"
        style={{ background: "rgba(63,185,80,0.06)", borderColor: "rgba(63,185,80,0.3)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--green)", color: "#0a0b0f" }}>
          <Activity size={14} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">Realtime feed active</div>
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            Every customer action across all tabs and windows appears here instantly.
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search activity by message or actor"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
          {(["all","CUSTOMER_ACTION","ADMIN_ACTION","SESSION_CHANGED","STORE_CHANGED"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition"
              style={{
                background: filter === f ? "var(--accent-dim)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--muted)",
              }}>
              {f === "all" ? "All" : f === "CUSTOMER_ACTION" ? "Customer" : f === "ADMIN_ACTION" ? "Admin" : f === "SESSION_CHANGED" ? "Sessions" : "Store"}
            </button>
          ))}
        </div>
      </div>

      <Panel padded={false}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Bell size={26} style={{ color: "var(--muted)", margin: "0 auto" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              {q || filter !== "all" ? "No events match your filter." : "No activity yet  customer actions will appear here live."}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((ev, i) => (
              <div key={i} className="px-5 py-3 border-b flex items-start gap-4 text-sm hover:bg-white/[0.02]"
                style={{ borderColor: "var(--border)" }}>
                <Badge kind={
                  ev.type === "CUSTOMER_ACTION" ? "amber"
                  : ev.type === "ADMIN_ACTION" ? "green"
                  : ev.type === "SESSION_CHANGED" ? "blue"
                  : "gray"
                }>
                  {ev.type.replace("_", " ")}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{ev.summary}</div>
                  {ev.actor && (
                    <div className="text-[11px] mono mt-0.5" style={{ color: "var(--muted)" }}>{ev.actor}</div>
                  )}
                </div>
                <div className="shrink-0 text-xs" style={{ color: "var(--muted)" }}>
                  <LiveTimeAgo ts={ev.at} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}