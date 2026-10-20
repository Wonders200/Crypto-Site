"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/app/providers";

const SDK_SRC = "https://trtc.io/knocket-sdk/sdk.js?identifier=e81e89ef40560094d7&v=1792455763567";

export default function LiveChatWidget() {
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
    <Script
      id="knocket-chat"
      src={SDK_SRC}
      strategy="afterInteractive"
    />
  );
}
