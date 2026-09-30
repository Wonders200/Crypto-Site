"use client";
import { useNow } from "@/hooks/useNow";

/**
 * Renders a formatted absolute date/time. Client-only to avoid
 * server vs client timezone/locale drift.
 * Modes:
 *   - "date":     Jan 15, 2026
 *   - "datetime": Jan 15, 2026, 3:42 PM
 *   - "time":     3:42:07 PM
 *   - "clock":    15:42:07 (24h, always has seconds)
 */
export default function LiveDate({
  ts,
  mode = "datetime",
  intervalMs = 1000,
}: {
  ts: number;
  mode?: "date" | "datetime" | "time" | "clock";
  intervalMs?: number;
}) {
  const now = useNow(intervalMs);

  // On server / first paint, render a placeholder with no live text
  if (now === null) {
    return <span suppressHydrationWarning></span>;
  }

  const d = new Date(ts);
  let out: string;

  switch (mode) {
    case "date":
      out = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      break;
    case "time":
      out = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      break;
    case "clock": {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      out = `${hh}:${mm}:${ss}`;
      break;
    }
    case "datetime":
    default:
      out = d.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
  }

  return <span suppressHydrationWarning>{out}</span>;
}