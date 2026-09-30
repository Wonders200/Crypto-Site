"use client";
import { useNow } from "@/hooks/useNow";

function fmt(ts: number, now: number): string {
  const s = Math.floor((now - ts) / 1000);
  if (s < 0) return "just now";
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

/**
 * Renders a live "time ago" string. Updates every 30 seconds.
 * Renders empty on server + first paint to avoid hydration mismatch.
 */
export default function LiveTimeAgo({
  ts,
  intervalMs = 30000,
  title,
}: {
  ts: number;
  intervalMs?: number;
  title?: string;
}) {
  const now = useNow(intervalMs);
  if (now === null) return <span suppressHydrationWarning></span>;
  return <span title={title ?? new Date(ts).toLocaleString()} suppressHydrationWarning>{fmt(ts, now)}</span>;
}