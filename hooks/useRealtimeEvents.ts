"use client";
import { useEffect, useState, useCallback } from "react";
import { onRealtime, RealtimeEvent } from "@/lib/realtime";
import { usePersistentState } from "./usePersistentState";

const FEED_KEY = "cs.activityFeed";
const MAX_FEED = 100;

export function useRealtimeEvents() {
  const [feed, setFeed] = usePersistentState<RealtimeEvent[]>(FEED_KEY, []);
  const [unread, setUnread] = usePersistentState<number>("cs.feedUnread", 0);

  // Listen for incoming events from other tabs
  useEffect(() => {
    const off = onRealtime(ev => {
      setFeed(prev => {
        const next = [ev, ...prev].slice(0, MAX_FEED);
        return next;
      });
      setUnread(u => u + 1);
    });
    return off;
  }, [setFeed, setUnread]);

  const markRead = useCallback(() => setUnread(0), [setUnread]);
  const clear = useCallback(() => { setFeed([]); setUnread(0); }, [setFeed, setUnread]);

  return { feed, unread, markRead, clear };
}