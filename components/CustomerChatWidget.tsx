"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth, useToast } from "@/app/providers";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Image as ImageIcon, Loader2, Check, CheckCheck } from "lucide-react";

export default function CustomerChatWidget() {
  const { user } = useAuth();
  const { push } = useToast();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [adminLastSeen, setAdminLastSeen] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = pathname?.startsWith("/admin");
  const customerId = user ? user.email.toLowerCase() : null;

  // 1. Fetch History
  useEffect(() => {
    if (!isOpen || !customerId) return;
    fetch(`/api/chat?action=history&customerId=${customerId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setMessages(d); });
  }, [isOpen, customerId]);

  // 2. Setup SSE & Presence Ping
  useEffect(() => {
    if (!isOpen || !customerId) return;
    
    const es = new EventSource(`/api/chat?action=stream&customerId=${customerId}`);
    es.onopen = () => setConnected(true);
    
    es.addEventListener("new_message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.customer_id === customerId) setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    es.addEventListener("messages_read", (e) => {
      const data = JSON.parse(e.data);
      if (data.customerId === customerId) {
        setMessages(prev => prev.map(m => ({ ...m, is_read: 1 })));
      }
    });

    es.addEventListener("presence_update", (e) => {
      const data = JSON.parse(e.data);
      if (data.customerId === customerId && data.type === "admin") setAdminLastSeen(data.time);
    });

    es.onerror = () => setConnected(false);

    // Ping every 30 seconds to keep customer online
    const pingInterval = setInterval(() => {
      fetch("/api/chat?action=ping", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, type: "customer" })
      }).catch(() => {});
    }, 30000);

    return () => { es.close(); clearInterval(pingInterval); };
  }, [isOpen, customerId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => setAttachment(ev.target?.result as string); reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !customerId) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, senderType: "customer", message: input.trim(), attachment }),
      });
      if (res.ok) { setInput(""); setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
    } catch (err: any) { push({ kind: "error", title: "Failed", message: err.message }); } 
    finally { setSending(false); }
  };

  const getAdminStatus = () => {
    if (!adminLastSeen) return "Offline";
    const diff = Date.now() - adminLastSeen;
    if (diff < 60000) return "Online";
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    return `Last seen ${Math.floor(diff / 3600000)}h ago`;
  };

  if (isAdmin || !user) return null;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 bg-[var(--accent)] text-white">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!connected && !isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg)]" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[350px] h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border bg-[var(--panel)] border-[var(--border)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--panel-2)] flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Live Support</div>
              <div className="text-[10px] flex items-center gap-1.5" style={{ color: connected ? "var(--green)" : "var(--muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? "var(--green)" : "var(--muted)" }} />
                {getAdminStatus()}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && <div className="text-center text-xs mt-10 text-[var(--muted)]">Send a message to start the conversation.</div>}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender_type === "customer" ? "rounded-tr-sm bg-[var(--accent)] text-white" : "rounded-tl-sm bg-[var(--panel-2)] text-[var(--text)]"}`}>
                  {msg.attachment_url && <img src={msg.attachment_url} className="max-w-full rounded-lg mb-2" />}
                  {msg.message && <div>{msg.message}</div>}
                  <div className="text-[9px] mt-1 opacity-50 flex items-center justify-end gap-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender_type === "customer" && (
                      msg.is_read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-[var(--border)] flex flex-col gap-2">
            {attachment && <div className="relative w-16 h-16 rounded border border-[var(--border)] overflow-hidden"><img src={attachment} className="w-full h-full object-cover" /><button onClick={() => setAttachment(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={10} /></button></div>}
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-[var(--muted)] hover:bg-white/5 rounded-lg"><ImageIcon size={18} /></button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-sm text-[var(--text)]" />
              <button type="submit" disabled={sending || (!input.trim() && !attachment)} className="p-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}