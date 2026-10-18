"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/app/providers";

const CHATWAY_ID = "KJwei64uf0IZ";
const CHATWAY_SRC = "https://cdn.chatway.app/widget.js?id=" + CHATWAY_ID;

export default function ChatwayWidget() {
  const pathname = usePathname() ?? "";
  const { admin } = useAdminAuth();
  
  const isAdmin = pathname.startsWith("/admin");
  
  // Superadmins always have chat. Support admins need "can_chat" permission.
  // Customers (no admin session) always have chat.
  const hasChatAccess = 
    !admin || 
    admin.role === "superadmin" || 
    admin.permissions?.includes("can_chat");

  if (isAdmin) return null;
  if (!hasChatAccess) return null;

  return (
    <>
      <Script
        id="chatway"
        src={CHATWAY_SRC}
        strategy="afterInteractive"
      />
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