"use client";
import { useState, useEffect, useRef } from "react";
import { PageHeader, Panel } from "@/components/admin/ui";
import { MessageSquare, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/app/providers";

type ChatMessage = {
  id: string;
  customer_id: string;
  sender_type: "customer" | "admin";
  message: string;
  attachment_url: string | null;
  created_at: number;
};

type ChatSession = {
  customer_id: string;
  last_msg: number;
  unread: number;
};

export default function AdminLiveChatPage() {
  const { push } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const activeIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep activeIdRef in sync without triggering re-renders
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadSessions = () => {
    fetch("/api/chat?action=admin_list", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/chat?action=history&customerId=${activeId}&isAdmin=true`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        loadSessions();
      })
      .catch(console.error);
  }, [activeId]);

  useEffect(() => {
    const eventSource = new EventSource("/api/chat?action=stream");

    eventSource.addEventListener("new_message", (e) => {
      const newMsg = JSON.parse(e.data);

      if (newMsg.customer_id === activeIdRef.current) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      loadSessions();
    });

    return () => eventSource.close();
  }, []);

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
    if ((!input.trim() && !attachment) || !activeId) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: activeId,
          senderType: "admin",
          message: input.trim(),
          attachment: attachment
        }),
      });

      if (res.ok) {
        setInput("");
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const err = await res.text();
        throw new Error(err);
      }
    } catch (err: any) {
      if (typeof push !== "undefined") push({ kind: "error", title: "Message failed", message: err.message || "Network error" });
      console.error("Chat send error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <PageHeader title="Live Chat" subtitle="Real-time customer support" />

      <div className="flex-1 flex gap-4 overflow-hidden min-h-[500px]">
        <Panel padded={false} className="w-80 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: "var(--border)" }}>
            Active Conversations
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-xs" style={{ color: "var(--muted)" }}>No active chats.</div>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.customer_id}
                  onClick={() => setActiveId(s.customer_id)}
                  className={`w-full text-left p-4 border-b transition hover:bg-white/[0.02] ${activeId === s.customer_id ? "bg-white/[0.04]" : ""}`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate pr-2">{s.customer_id}</span>
                    {s.unread > 0 && (
                      <span className="bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {s.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(s.last_msg).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel padded={false} className="flex-1 flex flex-col overflow-hidden">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={40} style={{ color: "var(--muted)", marginBottom: 16 }} />
              <div className="font-semibold">Select a conversation</div>
              <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Choose a customer from the sidebar to start replying.</div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}>
                <div className="font-semibold">{activeId}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.sender_type === "admin" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                      style={{
                        background: msg.sender_type === "admin" ? "var(--accent)" : "var(--panel-2)",
                        color: msg.sender_type === "admin" ? "#fff" : "var(--text)",
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

              <form onSubmit={sendMessage} className="p-3 border-t flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
                {attachment && (
                  <div className="relative w-16 h-16 rounded border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <img src={attachment} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setAttachment(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 text-xs">×</button>
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
                    placeholder="Type a reply..."
                    className="flex-1 bg-transparent outline-none text-sm px-2"
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
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}