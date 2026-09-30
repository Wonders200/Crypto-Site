/**
 * Realtime layer for cross-tab + cross-window sync inside the same browser.
 *
 * Two channels of communication:
 *   1. BroadcastChannel  instant, event-like messages between tabs
 *   2. storage event      native, fires when another tab writes localStorage
 *
 * Both fire within milliseconds. Admin sees customer actions in realtime
 * with zero polling. For cross-device realtime, swap this file for a
 * Socket.IO/SSE client with the same public API.
 */

export type RealtimeEventType =
  | "STORE_CHANGED"      // any mutation to the store
  | "CUSTOMER_ACTION"    // deposit / withdrawal / earn subscribe / KYC / trade
  | "ADMIN_ACTION"       // approval / rejection / edit
  | "SESSION_CHANGED"    // login / logout
  | "FORCE_LOGOUT";      // admin kicked a customer

export interface RealtimeEvent {
  type: RealtimeEventType;
  at: number;
  actor?: string;
  summary: string;
  payload?: any;
}

const CHANNEL_NAME = "cryptosite-realtime";

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }
  }
  return channel;
}

/** Broadcast a realtime event to all other tabs/windows in this browser. */
export function broadcast(type: RealtimeEventType, summary: string, opts?: { actor?: string; payload?: any }) {
  const ch = getChannel();
  if (!ch) return;
  const ev: RealtimeEvent = {
    type,
    at: Date.now(),
    summary,
    actor: opts?.actor,
    payload: opts?.payload,
  };
  try {
    ch.postMessage(ev);
  } catch {}
}

/** Subscribe to realtime events from other tabs. Returns an unsubscribe fn. */
export function onRealtime(handler: (ev: RealtimeEvent) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const listener = (e: MessageEvent) => {
    try {
      const ev = e.data as RealtimeEvent;
      if (ev && typeof ev.type === "string") handler(ev);
    } catch {}
  };
  ch.addEventListener("message", listener);
  return () => ch.removeEventListener("message", listener);
}

/** Subscribe to native storage events (fires only in OTHER tabs, not the source). */
export function onStorageChange(handler: (key: string, newValue: string | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: StorageEvent) => {
    if (e.key) handler(e.key, e.newValue);
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}