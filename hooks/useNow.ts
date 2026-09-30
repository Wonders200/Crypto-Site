"use client";
import { useEffect, useState } from "react";

/**
 * Returns a `Date.now()` value that updates every `intervalMs`.
 * Returns `null` on the server + first client render to avoid hydration
 * mismatches. After mount, starts returning real time and keeps ticking.
 */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return now;
}