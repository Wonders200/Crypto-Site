"use client";
import { useState, useEffect } from "react";
import { useAdminStore, useAuth, useToast } from "@/app/providers";
import BackButton from "@/components/BackButton";
import { X, Check, BookOpen, Clock, ChevronRight } from "lucide-react";

export default function LearnPage() {
  const { store, update } = useAdminStore();
  const { user } = useAuth();
  const { push } = useToast();
  const [detail, setDetail] = useState<any | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  const topics = (store.learnTopics ?? []).filter(t => t.enabled).sort((a, b) => a.order - b.order);

  const me: any = user ? (store.users ?? []).find((u: any) => u.email?.toLowerCase() === user.email.toLowerCase()) : null;
  const completed: string[] = me?.completedLessons ?? [];

  const openTopic = (topic: any) => {
    setDetail(topic);
  };

  const markComplete = (topicId: string) => {
    if (!me) { push({ kind: "info", title: "Sign in to track progress" }); return; }
    const already = completed.includes(topicId);
    const next = already ? completed.filter((id: string) => id !== topicId) : [...completed, topicId];
    update("users", (store.users ?? []).map((u: any) => u.id === me.id ? { ...u, completedLessons: next } : u));
    push({ kind: "success", title: already ? "Marked as unread" : "Marked as complete" });
  };

  const progressPct = topics.length > 0
    ? Math.round((completed.filter((id: string) => topics.some((t: any) => t.id === id)).length / topics.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-3 -ml-2">
        <BackButton fallback="/" label="Back to home" />
      </div>

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">Learn Crypto</h1>
        <p className="mt-2 text-sm md:text-base" style={{ color: "var(--muted)" }}>Short, practical lessons to build your foundation.</p>
      </div>

      {user && topics.length > 0 && (
        <div className="mb-6 panel p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>Your progress</div>
            <div className="text-sm font-bold" style={{ color: "var(--green)" }}>{progressPct}%</div>
          </div>
          <div style={{ height: 8, background: "var(--panel-2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: progressPct + "%", background: "var(--green)", transition: "width 0.4s" }} />
          </div>
          <div className="text-xs mt-2" style={{ color: "var(--muted-2)" }}>
            {completed.filter((id: string) => topics.some((t: any) => t.id === id)).length} of {topics.length} lessons completed
          </div>
        </div>
      )}

      {topics.length === 0 ? (
        <div className="panel p-12 text-center" style={{ color: "var(--muted)" }}>No topics yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {topics.map(t => {
            const isDone = completed.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => openTopic(t)}
                className="p-5 md:p-6 panel text-left hover:border-[color:var(--border-2)] transition flex flex-col"
                style={{ cursor: "pointer" }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-3xl">{t.icon || ""}</div>
                  {isDone && (
                    <span className="pill pill-green" style={{ fontSize: "0.7rem" }}>
                      <Check size={10} /> DONE
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mt-3">{t.title}</h3>
                <p className="text-sm mt-2 flex-1" style={{ color: "var(--muted)" }}>{t.desc}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-2)" }}>
                  <span className="flex items-center gap-1"><Clock size={11} /> {t.readTime || "3 min"}</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--green)" }}>
                    Read <ChevronRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setDetail(null)}>
          <div className="panel w-full max-w-2xl my-4" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-3xl shrink-0">{detail.icon || ""}</div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold">{detail.title}</h2>
                  <div className="text-xs mt-1 flex items-center gap-3 flex-wrap" style={{ color: "var(--muted)" }}>
                    {detail.category && <span className="pill pill-blue">{detail.category}</span>}
                    <span className="flex items-center gap-1"><Clock size={11} /> {detail.readTime || "3 min read"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded hover:bg-white/5 shrink-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 md:px-6 py-5 overflow-y-auto flex-1" style={{ lineHeight: 1.75 }}>
              <p className="text-base font-medium mb-4" style={{ color: "var(--text-soft)" }}>{detail.desc}</p>

              {detail.content ? (
                <div className="text-sm md:text-base" style={{ color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                  {detail.content}
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  <p className="mb-3">This lesson is being prepared. In the meantime, here's a quick overview:</p>
                  <p className="mb-3">Content for <strong style={{ color: "var(--text)" }}>{detail.title}</strong> will cover practical, hands-on explanation to get you confident with the topic.</p>
                  <p>Check back soon  new material is added regularly.</p>
                </div>
              )}

              {detail.keyTakeaways && Array.isArray(detail.keyTakeaways) && detail.keyTakeaways.length > 0 && (
                <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted)" }}>Key takeaways</div>
                  <ul className="space-y-2 text-sm" style={{ color: "var(--text-soft)" }}>
                    {detail.keyTakeaways.map((k: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className="shrink-0 mt-0.5" style={{ color: "var(--green)" }} />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 md:px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs" style={{ color: "var(--muted-2)" }}>
                {completed.includes(detail.id) ? " Completed" : "Mark as complete when you're done"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => markComplete(detail.id)}
                  className="btn text-sm"
                  style={completed.includes(detail.id)
                    ? { background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                    : { background: "var(--green)", color: "#0a0b0f", border: "none" }}
                >
                  {completed.includes(detail.id) ? "Mark as unread" : "Mark as complete"}
                </button>
                <button onClick={() => setDetail(null)} className="btn btn-ghost text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}