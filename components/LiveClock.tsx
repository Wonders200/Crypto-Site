"use client";
import { useNow } from "@/hooks/useNow";

/** A live wall clock that updates every second. */
export default function LiveClock({ intervalMs = 1000 }: { intervalMs?: number }) {
  const now = useNow(intervalMs);
  if (now === null) return <span suppressHydrationWarning></span>;
  const d = new Date(now);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return <span className="mono" suppressHydrationWarning>{hh}:{mm}:{ss}</span>;
}