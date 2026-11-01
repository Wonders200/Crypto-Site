"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/providers";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Image as ImageIcon, Loader2 } from "lucide-react";

type ChatMessage = {
  id: string;
  customer_id: string;
  sender_type: "customer" | "admin";
  message: string;
  attachment_url: string | null;
  created_at: number;
};

export default function CustomerChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hide on admin pages or if not logged in
  const isAdmin = pathname?.startsWith("/admin");
  const matchedUser = user ? { id: user.email } : null; // Using email as fallback ID for the demo

  // Fetch initial history
  useEffect(() => {
    if (!isOpen || !matchedUser) return;

    fetch(`/api/chat?action=history&customerId=${matchedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error);
  }, [isOpen, matchedUser]);

  // Setup SSE connection
  useEffect(() => {
    if (!isOpen || !matchedUser) return;

    const eventSource = new EventSource("/api/chat?action=stream");

    eventSource.onopen = () => setConnected(true);
    
    eventSource.addEventListener("new_message", (e) => {
      const newMsg = JSON.parse(e.data);
      // Only add if it's for this customer
      if (newMsg.customer_id === matchedUser.id) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, matchedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachment(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !matchedUser) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: matchedUser.id,
          senderType: "customer",
          message: input.trim(),
          attachment: attachment
        }),
      });

      if (res.ok) {
        setInput("");
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      // silent fail
    } finally {
      setSending(false);
    }
  };

  if (isAdmin || !user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!connected && !isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg)]" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[9999] w-[350px] h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border animate-in slide-in-from-bottom-4 duration-300"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}>
            <div>
              <div className="font-semibold text-sm">Live Support</div>
              <div className="text-[10px] flex items-center gap-1.5" style={{ color: connected ? "var(--green)" : "var(--muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? "var(--green)" : "var(--muted)" }} />
                {connected ? "Online" : "Connecting..."}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center text-xs mt-10" style={{ color: "var(--muted)" }}>
                Send a message to start the conversation.
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender_type === "customer" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                  style={{
                    background: msg.sender_type === "customer" ? "var(--accent)" : "var(--panel-2)",
                    color: msg.sender_type === "customer" ? "#fff" : "var(--text)",
                  }}
                >
                  {msg.attachment_url && (
                    <img src={msg.attachment_url} alt="attachment" className="max-w-full rounded-lg mb-2" />
                  )}
                  {msg.message && <div>{msg.message}</div>}
                  <div className="text-[9px] mt-1 opacity-50 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 border-t flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
            {attachment && (
              <div className="relative w-16 h-16 rounded border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <img src={attachment} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setAttachment(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={10} /></button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white/5" style={{ color: "var(--muted)" }}>
                <ImageIcon size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text)" }}
              />
              <button
                type="submit"
                disabled={sending || (!input.trim() && !attachment)}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}