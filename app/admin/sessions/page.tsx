"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminSession } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Badge, Kpi } from "@/components/admin/ui";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { parseUA } from "@/lib/parseUA";
import { Trash2, Copy, Check, Globe, Monitor, Smartphone, Tablet, Bot, MapPin } from "lucide-react";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

function duration(from: number, to?: number): string {
  const ms = (to ?? Date.now()) - from;
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h " + (m % 60) + "m";
  return Math.floor(h / 24) + "d " + (h % 24) + "h";
}

function deviceIcon(type?: string) {
  const t = (type ?? "").toLowerCase();
  if (t === "mobile") return <Smartphone size={12} />;
  if (t === "tablet") return <Tablet size={12} />;
  if (t === "bot") return <Bot size={12} />;
  return <Monitor size={12} />;
}

/** Fallback: if the session was created before our parser existed, derive it from userAgent */
function deriveDevice(s: AdminSession) {
  if (s.browser && s.os) {
    return {
      browser: s.browser,
      browserVersion: s.browserVersion ?? "",
      os: s.os,
      osVersion: s.osVersion ?? "",
      deviceType: s.deviceType ?? "Unknown",
    };
  }
  const parsed = parseUA(s.userAgent);
  return {
    browser: parsed.browser,
    browserVersion: parsed.browserVersion,
    os: parsed.os,
    osVersion: parsed.osVersion,
    deviceType: parsed.deviceType,
  };
}

/** Friendly IP display  shows "Local network" for 127.0.0.1 */
function displayIP(ip?: string): { label: string; isLocal: boolean } {
  if (!ip) return { label: "Unknown", isLocal: false };
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return { label: "Local network", isLocal: true };
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) return { label: ip + " (LAN)", isLocal: true };
  return { label: ip, isLocal: false };
}

export default function AdminSessionsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [filter, setFilter] = useState<"all" | "online" | "ended">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sessions = useMemo(() => {
    return [...(store.sessions ?? [])]
      .filter(s => {
        if (filter === "all") return true;
        const online = s.active && Date.now() - s.lastSeenAt < ONLINE_WINDOW_MS;
        return filter === "online" ? online : !s.active;
      })
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  }, [store.sessions, filter]);

  const active = (store.sessions ?? []).filter(s => s.active && Date.now() - s.lastSeenAt < ONLINE_WINDOW_MS);
  const totalSessions = (store.sessions ?? []).length;

  const forceLogout = (s: AdminSession) => {
    if (!confirm("Force logout " + s.email + "?")) return;
    update("sessions", (store.sessions ?? []).map(x => (x.id === s.id ? { ...x, active: false, endedAt: Date.now() } : x)));
    log("FORCE_LOGOUT", "Session " + s.id, s.email);
    push({ kind: "success", title: "Signed out " + s.email });
  };

  const clearOld = () => {
    const cutoff = Date.now() - 7 * 86400000;
    const kept = (store.sessions ?? []).filter(s => s.active || (s.endedAt ?? 0) > cutoff);
    const removed = (store.sessions ?? []).length - kept.length;
    if (removed === 0) { push({ kind: "info", title: "Nothing to clear" }); return; }
    if (!confirm("Delete " + removed + " ended sessions older than 7 days?")) return;
    update("sessions", kept);
    log("PRUNE", "Sessions", "Removed " + removed);
    push({ kind: "success", title: "Removed " + removed + " old sessions" });
  };

  const copyIP = async (s: AdminSession) => {
    if (!s.ip) return;
    try {
      await navigator.clipboard.writeText(s.ip);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div>
      <PageHeader
        title="Sessions"
        subtitle={active.length + " online now  " + totalSessions + " total records"}
        actions={<Btn kind="ghost" onClick={clearOld}><Trash2 size={12} /> Prune old sessions</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Kpi label="Online now" value={String(active.length)} tone="green" sub="Last seen < 2 min ago" />
        <Kpi label="Total sessions" value={String(totalSessions)} sub="Active + historical" />
        <Kpi label="Unique users" value={String(new Set((store.sessions ?? []).map(s => s.userId)).size)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
          {(["all", "online", "ended"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition"
              style={{
                background: filter === f ? "var(--accent-dim)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--muted)",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <Panel padded={false}>
        <DataTable<AdminSession>
          keyFn={s => s.id}
          rows={sessions}
          empty="No sessions yet."
          columns={[
            // USER
            { key: "user", label: "User", render: s => {
              const online = s.active && Date.now() - s.lastSeenAt < ONLINE_WINDOW_MS;
              return (
                <div className="flex items-center gap-3">
                  <span className="relative flex w-2 h-2 shrink-0">
                    {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "var(--green)" }} />}
                    <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: online ? "var(--green)" : "var(--muted-2)" }} />
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{s.email}</div>
                  </div>
                </div>
              );
            }},
            // DEVICE
            { key: "device", label: "Device", render: s => {
              const d = deriveDevice(s);
              const bv = d.browserVersion ? d.browserVersion.split(".")[0] : "";
              const ov = d.osVersion ? " " + d.osVersion : "";
              return (
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {deviceIcon(d.deviceType)}
                  </span>
                  <div>
                    <div className="text-xs font-semibold">
                      {d.browser}{bv ? " " + bv : ""}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                      {d.os}{ov}
                    </div>
                  </div>
                </div>
              );
            }},
            // IP ADDRESS
            { key: "ip", label: "IP address", render: s => {
              const d = displayIP(s.ip);
              return (
                <div className="flex items-center gap-1.5">
                  <Globe size={11} style={{ color: d.isLocal ? "var(--muted)" : "var(--accent)" }} />
                  <span className="mono text-xs" style={{ color: d.isLocal ? "var(--muted)" : "var(--text)" }}>
                    {d.label}
                  </span>
                  {s.ip && (
                    <button onClick={() => copyIP(s)} title="Copy IP" className="p-0.5 hover:opacity-70">
                      {copiedId === s.id
                        ? <Check size={10} style={{ color: "var(--green)" }} />
                        : <Copy size={10} style={{ color: "var(--muted)" }} />}
                    </button>
                  )}
                </div>
              );
            }},
            // SESSION ID
            { key: "id", label: "Session ID", render: s => <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>{s.id}</span> },
            // STARTED
            { key: "started", label: "Started", align: "right", render: s => (
              <span className="text-xs" style={{ color: "var(--muted)" }}><LiveTimeAgo ts={s.startedAt} /></span>
            )},
            // LAST SEEN
            { key: "seen", label: "Last seen", align: "right", render: s => (
              <span className="text-xs" style={{ color: "var(--muted)" }}><LiveTimeAgo ts={s.lastSeenAt} /></span>
            )},
            // DURATION
            { key: "dur", label: "Duration", align: "right", render: s => (
              <span className="mono text-xs">{duration(s.startedAt, s.endedAt)}</span>
            )},
            // STATUS
            { key: "status", label: "Status", align: "center", render: s => {
              const online = s.active && Date.now() - s.lastSeenAt < ONLINE_WINDOW_MS;
              return <Badge kind={online ? "green" : s.active ? "amber" : "gray"}>{online ? "ONLINE" : s.active ? "IDLE" : "ENDED"}</Badge>;
            }},
            // ACTION
            { key: "act", label: "", align: "right", render: s => s.active ? (
              <Btn kind="danger" size="sm" onClick={() => forceLogout(s)}>Force logout</Btn>
            ) : <span className="text-xs" style={{ color: "var(--muted-2)" }}></span> },
          ]}
        />
      </Panel>
    </div>
  );
}
