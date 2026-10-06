'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_PAGES, PageContent } from './pageContent';

export function usePageContent(slug: string): { content: PageContent; loading: boolean } {
  const [content, setContent] = useState<PageContent>(DEFAULT_PAGES[slug] || { title: slug, subtitle: '', blocks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages')
      .then(r => r.json())
      .then(data => {
        if (data && data[slug]) setContent(data[slug]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return { content, loading };
}
