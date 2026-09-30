"use client";
import { useAdminStore } from "@/app/providers";
import BackButton from "@/components/BackButton";

export default function LearnPage() {
  const { store } = useAdminStore();
  const topics = store.learnTopics.filter(t => t.enabled).sort((a, b) => a.order - b.order);
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-3 -ml-2">
        <BackButton fallback="/" label="Back to home" />
      </div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Learn Crypto</h1>
        <p className="mt-2" style={{ color: "var(--muted)" }}>Short, practical lessons to build your foundation.</p>
      </div>
      {topics.length === 0 ? (
        <div className="panel p-12 text-center" style={{ color: "var(--muted)" }}>No topics yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(t => (
            <div key={t.id} className="p-6 panel hover:border-[color:var(--border-2)] transition">
              <div className="text-3xl">{t.icon}</div>
              <h3 className="font-semibold text-lg mt-3">{t.title}</h3>
              <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}