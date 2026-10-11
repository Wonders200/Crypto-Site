"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CHATWAY_ID = "KJwei64uf0IZ";
const CHATWAY_SRC = "https://cdn.chatway.app/widget.js?id=" + CHATWAY_ID;

/**
 * Loads the Chatway chat widget for customers only.
 * Hidden (and not loaded) on /admin/* routes so the operator never sees it.
 */
export default function ChatwayWidget() {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  // If a customer opened the chat and then navigates to /admin,
  // tear down the widget from the DOM.
  useEffect(() => {
    if (!isAdmin) return;
    try {
      // Chatway injects a host element; find any element with a chatway id/class.
      const nodes = document.querySelectorAll('[id*="chatway" i], [class*="chatway" i]');
      nodes.forEach((n) => {
        const el = n as HTMLElement;
        // Only hide, don't remove  the script may re-inject on next customer page.
        el.style.setProperty("display", "none", "important");
      });
    } catch {}
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <Script
        id="chatway"
        src={CHATWAY_SRC}
        strategy="afterInteractive"
      />
      {/* Style override  the launcher lives in a shadow root so this
          only styles the light-DOM wrapper. Full color control is in the
          Chatway dashboard (Settings  Appearance  Primary color). */}
      <style>{`
        #chatway-widget button,
        #chatway-container button,
        [class*="chatway-launcher" i],
        [class*="chatway-button" i] {
          background-color: #22c55e !important;
          border-color: #22c55e !important;
        }
      `}</style>
    </>
  );
}