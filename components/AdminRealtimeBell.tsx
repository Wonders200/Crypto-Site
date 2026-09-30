"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, X, CheckCircle2, AlertCircle, Info, Clock } from "lucide-react";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function iconFor(type: string) {
  if (type === "CUSTOMER_ACTION") return <AlertCircle size={13} style={{ color: "#e3b341" }} />;
  if (type === "ADMIN_ACTION") return <CheckCircle2 size={13} style={{ color: "#3fb950" }} />;
  if (type === "STORE_CHANGED") return <Info size={13} style={{ color: "#7c8ff5" }} />;
  if (type === "SESSION_CHANGED") return <Clock size={13} style={{ color: "#8b949e" }} />;
  return <Info size={13} style={{ color: "#8b949e" }} />;
}

export default function AdminRealtimeBell() {
  const { feed, unread, markRead, clear } = useRealtimeEvents();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle}
        className="relative p-2 rounded-lg hover:bg-white/5 transition"
        title="Live activity">
        <Bell size={16} style={{ color: "var(--muted)" }} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold"
            style={{ background: "var(--red)", color: "#fff" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 panel-2 shadow-2xl z-[100] max-h-[500px] flex flex-col"
          style={{ border: "1px solid var(--border-2)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}>
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              Live activity
            </div>
            <div className="flex items-center gap-2">
              {feed.length > 0 && (
                <button onClick={clear} className="text-[10px] hover:opacity-70" style={{ color: "var(--muted)" }}>
                  Clear
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/5 rounded">
                <X size={12} style={{ color: "var(--muted)" }} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto scrollbar-thin flex-1">
            {feed.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: "var(--muted)" }}>
                No activity yet. Customer actions will appear here in realtime.
              </div>
            ) : (
              feed.slice(0, 30).map((ev, i) => (
                <div key={i} className="px-4 py-3 border-b flex items-start gap-3 hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="mt-0.5 shrink-0">{iconFor(ev.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{ev.summary}</div>
                    <div className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      {ev.actor && <span className="mono truncate max-w-[140px]">{ev.actor}</span>}
                      <span></span>
                      <span>{timeAgo(ev.at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/admin/activity" onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-center text-xs font-semibold border-t hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
            View full activity log 
          </Link>
        </div>
      )}
    </div>
  );
}