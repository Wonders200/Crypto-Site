"use client";
import { useEffect, useRef, useCallback } from "react";
import { onRealtime, RealtimeEvent, RealtimeEventType } from "@/lib/realtime";
import { usePersistentState } from "./usePersistentState";

const FEED_KEY = "cs.activityFeed";
const MAX_FEED = 100;
const POLL_MS = 8000;

type AuditEntry = {
  id: string;
  at: number;
  actor: string;
  action: string;
  target: string;
  details?: string;
};

function classifyAudit(action: string): RealtimeEventType {
  const a = (action || "").toUpperCase();
  if (a.includes("LOGIN") || a.includes("LOGOUT") || a.includes("SESSION")) return "SESSION_CHANGED";
  if (a.includes("DEPOSIT") || a.includes("WITHDRAW") || a.includes("EARN")
      || a.includes("KYC") || a.includes("TRADE") || a.includes("SUBMIT")) return "CUSTOMER_ACTION";
  if (a.includes("APPROVE") || a.includes("REJECT") || a.includes("EDIT")
      || a.includes("UPDATE") || a.includes("FUND") || a.includes("DELETE")) return "ADMIN_ACTION";
  return "STORE_CHANGED";
}

function auditToEvent(entry: AuditEntry): RealtimeEvent {
  const head = [entry.action, entry.target].filter(Boolean).join(" ");
  const summary = entry.details ? head + " - " + entry.details : head;
  return {
    type: classifyAudit(entry.action),
    at: entry.at || Date.now(),
    actor: entry.actor,
    summary,
    payload: entry,
  };
}

export function useRealtimeEvents() {
  const [feed, setFeed] = usePersistentState<RealtimeEvent[]>(FEED_KEY, []);
  const [unread, setUnread] = usePersistentState<number>("cs.feedUnread", 0);
  const lastAuditIdRef = useRef<string | null>(null);
  const seededRef = useRef(false);

  // Same-browser events via BroadcastChannel (instant)
  useEffect(() => {
    const off = onRealtime(ev => {
      setFeed(prev => [ev, ...prev].slice(0, MAX_FEED));
      setUnread(u => u + 1);
    });
    return off;
  }, [setFeed, setUnread]);

  // Cross-device events via polling the server audit log
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/store", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const audit: AuditEntry[] = data?.store?.audit ?? [];
        if (cancelled || !Array.isArray(audit) || audit.length === 0) return;

        const headId = audit[0]?.id ?? null;

        // First poll: seed the anchor, do not flood the feed
        if (!seededRef.current || !lastAuditIdRef.current) {
          lastAuditIdRef.current = headId;
          seededRef.current = true;
          return;
        }

        if (!headId || headId === lastAuditIdRef.current) return;

        // Collect entries newer than the last seen (audit is newest-first)
        const fresh: AuditEntry[] = [];
        let foundAnchor = false;
        for (const entry of audit) {
          if (entry.id === lastAuditIdRef.current) { foundAnchor = true; break; }
          fresh.push(entry);
        }

        // If our anchor disappeared (log truncated), take only the newest entry
        if (!foundAnchor) fresh.length = Math.min(fresh.length, 1);
        if (fresh.length === 0) { lastAuditIdRef.current = headId; return; }

        const events = fresh.map(auditToEvent);

        setFeed(prev => {
          const seen = new Set<string>();
          for (const e of prev) {
            const id = e.payload?.id;
            if (typeof id === "string") seen.add(id);
          }
          const unique = events.filter(e => {
            const id = e.payload?.id;
            return !(typeof id === "string" && seen.has(id));
          });
          if (unique.length === 0) return prev;
          return [...unique, ...prev].slice(0, MAX_FEED);
        });
        setUnread(u => u + fresh.length);
        lastAuditIdRef.current = headId;
      } catch {
        // silent - offline or transient
      }
    }

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [setFeed, setUnread]);

  const markRead = useCallback(() => setUnread(0), [setUnread]);
  const clear = useCallback(() => { setFeed([]); setUnread(0); }, [setFeed, setUnread]);

  return { feed, unread, markRead, clear };
}