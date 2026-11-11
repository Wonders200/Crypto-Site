"use client";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/admin/ui";
import { MessageSquare, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/app/providers";

export default function AdminLiveChatPage() {
  const { push } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const activeIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const loadSessions = () => {
    fetch("/api/chat?action=admin_list", { cache: "no-store" }).then(r => r.json()).then(d => { if (Array.isArray(d)) setSessions(d); }).catch(console.error);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 3000); // Polling fallback
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/chat?action=history&customerId=${activeId}&isAdmin=true`, { cache: "no-store" }).then(r => r.json()).then(d => {
      if (Array.isArray(d)) setMessages(d);
      loadSessions();
    }).catch(console.error);
  }, [activeId]);

  useEffect(() => {
    const es = new EventSource("/api/chat?action=stream");
    es.addEventListener("new_message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.customer_id === activeIdRef.current) {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
      loadSessions();
    });
    return () => es.close();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => setAttachment(ev.target?.result as string); reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !activeId) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: activeId, senderType: "admin", message: input.trim(), attachment }),
      });
      if (res.ok) { setInput(""); setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
      else throw new Error(await res.text());
    } catch (err: any) { push({ kind: "error", title: "Failed", message: err.message }); } 
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[var(--bg)]">
      <div className="shrink-0 px-6 pt-4"><PageHeader title="Live Chat" subtitle="Real-time customer support" /></div>
      <div className="flex-1 flex overflow-hidden border-t border-[var(--border)] mt-4">
        
        {/* Sidebar - Scrolls Independently */}
        <div className="w-80 flex flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--panel)]">
          <div className="p-4 border-b border-[var(--border)] font-semibold text-sm shrink-0">Active Conversations</div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {sessions.length === 0 ? <div className="p-6 text-center text-xs text-[var(--muted)]">No active chats.</div> : 
              sessions.map(s => (
                <button key={s.customer_id} onClick={() => setActiveId(s.customer_id)} className={`w-full text-left p-4 border-b border-[var(--border)] hover:bg-white/[0.02] ${activeId === s.customer_id ? "bg-white/[0.04]" : ""}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate pr-2">{s.customer_id}</span>
                    {s.unread > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{s.unread}</span>}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{new Date(s.last_msg).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Main Chat Area - Scrolls Independently */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)]">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={40} className="text-[var(--muted)] mb-4" />
              <div className="font-semibold">Select a conversation</div>
              <div className="text-sm text-[var(--muted)] mt-1">Choose a customer to start replying.</div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[var(--border)] bg-[var(--panel-2)] shrink-0 font-semibold">{activeId}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.sender_type === "admin" ? "rounded-tr-sm bg-[var(--accent)] text-white" : "rounded-tl-sm bg-[var(--panel-2)] text-[var(--text)]"}`}>
                      {msg.attachment_url && <img src={msg.attachment_url} alt="attachment" className="max-w-full rounded-lg mb-2" />}
                      {msg.message && <div>{msg.message}</div>}
                      <div className="text-[9px] mt-1 opacity-50 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-3 border-t border-[var(--border)] flex flex-col gap-2 shrink-0">
                {attachment && <div className="relative w-16 h-16 rounded border border-[var(--border)] overflow-hidden"><img src={attachment} className="w-full h-full object-cover" /><button onClick={() => setAttachment(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 text-xs">×</button></div>}
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-[var(--muted)] hover:bg-white/5 rounded-lg"><ImageIcon size={18} /></button>
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a reply..." className="flex-1 bg-transparent outline-none text-sm px-2 text-[var(--text)]" />
                  <button type="submit" disabled={sending || (!input.trim() && !attachment)} className="p-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}