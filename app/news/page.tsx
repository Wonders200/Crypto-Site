"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useAdminStore } from "@/app/providers";
import BackButton from "@/components/BackButton";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Pin, RefreshCw } from "lucide-react";

export default function NewsPage() {
  const { store, refreshNews } = useAdminStore();

  useEffect(() => {
    if (!store.newsMeta?.autoRefresh) return;
    const hours = (Date.now() - store.newsMeta.lastRefresh) / 3600000;
    if (hours >= store.newsMeta.refreshIntervalHours) refreshNews();
  }, [store.newsMeta?.lastRefresh, store.newsMeta?.autoRefresh, store.newsMeta?.refreshIntervalHours, refreshNews]);

  const articles = (store.news ?? [])
    .filter(n => n.enabled)
    .sort((a, b) => {
      const pinDiff = Number(b.pinned) - Number(a.pinned);
      if (pinDiff !== 0) return pinDiff;
      return b.publishedAt - a.publishedAt;
    });

  const featured = articles.find(a => a.featured);
  const rest = articles.filter(a => a !== featured);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-3 -ml-2">
        <BackButton fallback="/" label="Back to home" />
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">News &amp; Analysis</h1>
          <p className="mt-2" style={{ color: "var(--muted)" }}>
            Curated crypto stories  refreshed daily.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <RefreshCw size={12} />
          <span>
            Updated {store.newsMeta.lastRefresh ? <LiveTimeAgo ts={store.newsMeta.lastRefresh} /> : "just now"}
          </span>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="panel p-12 text-center" style={{ color: "var(--muted)" }}>
          Loading feed
        </div>
      ) : (
        <>
          {featured && (
            <article
              className="panel p-6 mb-5 hover:border-[color:var(--border-2)] transition"
              style={{ borderColor: "var(--green)" }}
            >
              <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--muted)" }}>
                <span className="pill pill-green">Featured</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>{featured.source}</span>
                <span></span>
                <span><LiveTimeAgo ts={featured.publishedAt} /></span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">{featured.title}</h2>
              <p className="mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
                {featured.summary}
              </p>
            </article>
          )}

          <div className="space-y-3">
            {rest.map(a => (
              <article key={a.id} className="p-5 panel hover:border-[color:var(--border-2)] transition">
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                  {a.pinned && <Pin size={11} fill="var(--amber)" stroke="var(--amber)" />}
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>{a.source}</span>
                  <span></span>
                  <span><LiveTimeAgo ts={a.publishedAt} /></span>
                  {a.symbol && <span className="pill pill-gray ml-auto">{a.symbol}</span>}
                </div>
                <h2 className="text-lg font-semibold mt-2">{a.title}</h2>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {a.summary}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}