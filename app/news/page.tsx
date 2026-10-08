"use client";
import { useState } from "react";
import { useAdminStore } from "@/app/providers";
import BackButton from "@/components/BackButton";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { X, Clock, ExternalLink, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function NewsPage() {
  const { store } = useAdminStore();
  const [detail, setDetail] = useState<any | null>(null);
  const [filter, setFilter] = useState("All");

  const allNews = (store.news ?? [])
    .filter((n: any) => n.enabled !== false)
    .sort((a: any, b: any) => Number(b.pinned) - Number(a.pinned) || (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

  const categories = ["All", ...Array.from(new Set(allNews.map((n: any) => n.category).filter(Boolean)))] as string[];
  const news = filter === "All" ? allNews : allNews.filter((n: any) => n.category === filter);
  const featured = news[0];
  const rest = news.slice(1);

  if (allNews.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <BackButton fallback="/" label="Back to home" />
        <h1 className="text-2xl md:text-4xl font-bold mt-3 mb-2">News &amp; Analysis</h1>
        <p className="mb-8 text-sm md:text-base" style={{ color: "var(--muted)" }}>The latest from the crypto markets.</p>
        <div className="panel p-12 text-center" style={{ color: "var(--muted)" }}>
          No news yet. Check back soon.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-3 -ml-2">
        <BackButton fallback="/" label="Back to home" />
      </div>

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">News &amp; Analysis</h1>
        <p className="mt-2 text-sm md:text-base" style={{ color: "var(--muted)" }}>The latest from the crypto markets.</p>
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: filter === cat ? "var(--green)" : "var(--panel-2)",
                color: filter === cat ? "#0a0b0f" : "var(--muted)",
                border: "1px solid " + (filter === cat ? "var(--green)" : "var(--border)"),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Featured article */}
      {featured && (
        <button
          onClick={() => setDetail(featured)}
          className="panel p-5 md:p-6 mb-6 w-full text-left hover:border-[color:var(--border-2)] transition block"
          style={{ cursor: "pointer" }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {featured.pinned && <span className="pill pill-amber"> PINNED</span>}
            {featured.category && <span className="pill pill-blue">{featured.category}</span>}
            {featured.source && <span className="pill pill-gray">{featured.source}</span>}
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight">{featured.title}</h2>
          {featured.summary && (
            <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
              {featured.summary}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--muted-2)" }}>
            {featured.publishedAt && <><Clock size={11} /> <LiveTimeAgo ts={featured.publishedAt} /></>}
            <span className="font-semibold" style={{ color: "var(--green)" }}>Read full story </span>
          </div>
        </button>
      )}

      {/* Grid of remaining articles */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {rest.map((n: any) => (
            <button
              key={n.id}
              onClick={() => setDetail(n)}
              className="panel p-5 text-left hover:border-[color:var(--border-2)] transition flex flex-col"
              style={{ cursor: "pointer" }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {n.pinned && <span className="pill pill-amber"></span>}
                {n.category && <span className="pill pill-blue">{n.category}</span>}
              </div>
              <h3 className="font-semibold text-base leading-snug">{n.title}</h3>
              {n.summary && (
                <p className="text-sm mt-2 flex-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                  {n.summary.slice(0, 140)}{n.summary.length > 140 ? "..." : ""}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-2)" }}>
                <span className="truncate">{n.source || "ApexVault"}</span>
                {n.publishedAt && <span className="shrink-0"><LiveTimeAgo ts={n.publishedAt} /></span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setDetail(null)}>
          <div className="panel w-full max-w-2xl my-4" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex flex-wrap items-center gap-2">
                {detail.pinned && <span className="pill pill-amber"> PINNED</span>}
                {detail.category && <span className="pill pill-blue">{detail.category}</span>}
                {detail.source && <span className="pill pill-gray">{detail.source}</span>}
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded hover:bg-white/5 shrink-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 md:px-6 py-5 overflow-y-auto flex-1">
              <h2 className="text-lg md:text-2xl font-bold leading-tight mb-3">{detail.title}</h2>

              <div className="flex flex-wrap items-center gap-3 text-xs mb-5 pb-4 border-b" style={{ color: "var(--muted-2)", borderColor: "var(--border)" }}>
                {detail.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date(detail.publishedAt).toLocaleString()}
                  </span>
                )}
                {detail.publishedAt && <span></span>}
                <span className="flex items-center gap-1"><Clock size={11} /> <LiveTimeAgo ts={detail.publishedAt} /></span>
                {detail.symbol && <><span></span><span className="pill pill-green">{detail.symbol}</span></>}
              </div>

              {detail.image && (
                <img src={detail.image} alt={detail.title} className="w-full rounded-xl mb-5" style={{ maxHeight: 300, objectFit: "cover" }} />
              )}

              {detail.summary && (
                <p className="text-base font-medium mb-4 leading-relaxed" style={{ color: "var(--text-soft)" }}>
                  {detail.summary}
                </p>
              )}

              {detail.body ? (
                <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                  {detail.body}
                </div>
              ) : (
                <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  <p className="mb-3">Full article content is being prepared. In the meantime, here's what you should know:</p>
                  <p className="mb-3">This story is developing. Check back soon for the complete analysis.</p>
                </div>
              )}

              {detail.url && (
                <a href={detail.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold"
                  style={{ color: "var(--green)" }}>
                  <ExternalLink size={13} /> Read original source
                </a>
              )}
            </div>

            <div className="px-5 md:px-6 py-4 border-t flex justify-end" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setDetail(null)} className="btn btn-ghost text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}