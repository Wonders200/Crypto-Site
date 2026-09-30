"use client";
import { useEffect, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_CRYPTOPANIC_TOKEN ?? "";

export interface LiveArticle {
  id: string;
  title: string;
  source: string;
  summary: string;
  publishedAt: number;
  url: string;
}

export function hasLiveNews(): boolean {
  return Boolean(KEY);
}

export function useNewsFeed(): { articles: LiveArticle[]; live: boolean; loading: boolean } {
  const [articles, setArticles] = useState<LiveArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!KEY) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://cryptopanic.com/api/v1/posts/?auth_token=${KEY}&public=true&kind=news`
        );
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        if (cancelled) return;
        setArticles((data?.results ?? []).slice(0, 20).map((p: any) => ({
          id: String(p.id),
          title: p.title,
          source: p.source?.title ?? "CryptoPanic",
          summary: p.title,
          publishedAt: Date.parse(p.published_at) || Date.now(),
          url: p.url,
        })));
        setLive(true);
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return { articles, live, loading };
}