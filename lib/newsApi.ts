import { AdminNews, uid } from "./adminStore";

/**
 * Optional real news adapter.
 * Set NEXT_PUBLIC_CRYPTOPANIC_TOKEN in .env.local to fetch live headlines.
 * Falls back to null (site uses the built-in generator) when unconfigured
 * or when the request fails.
 */
export function hasLiveNews(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CRYPTOPANIC_TOKEN);
}

export async function fetchLiveNews(): Promise<AdminNews[] | null> {
  const token = process.env.NEXT_PUBLIC_CRYPTOPANIC_TOKEN;
  if (!token) return null;
  try {
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${token}&public=true&kind=news`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const items = Array.isArray(json?.results) ? json.results : [];
    return items.slice(0, 20).map((p: any) => ({
      id: uid("n"),
      title: String(p.title ?? "Untitled"),
      source: String(p.source?.title ?? "CryptoPanic"),
      summary: String(p.title ?? ""),
      publishedAt: Date.parse(p.published_at ?? "") || Date.now(),
      featured: false,
      enabled: true,
      pinned: false,
      origin: "auto" as const,
    }));
  } catch { return null; }
}