'use client';
import React, { useEffect, useState } from 'react';
import { DEFAULT_PAGES, PageContent } from '@/lib/pageContent';

const SLUGS = ['about', 'careers', 'contact', 'api-docs', 'status', 'blog', 'terms', 'privacy', 'risk-disclosures'];
const LABELS: Record<string,string> = {
  'about': 'About', 'careers': 'Careers', 'contact': 'Contact', 'api-docs': 'API Docs',
  'status': 'Status', 'blog': 'Blog', 'terms': 'Terms', 'privacy': 'Privacy', 'risk-disclosures': 'Risk Disclosures'
};

export default function AdminPagesPage() {
  const [activeSlug, setActiveSlug] = useState('about');
  const [pages, setPages] = useState<Record<string, PageContent>>(DEFAULT_PAGES);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/pages').then(r => r.json()).then(setPages).catch(() => {});
  }, []);

  const updateCurrent = (patch: Partial<PageContent>) => {
    setPages(p => ({ ...p, [activeSlug]: { ...p[activeSlug], ...patch } }));
    setSaved(false);
  };

  const updateBlock = (i: number, patch: Partial<{ heading: string; body: string }>) => {
    const blocks = [...(pages[activeSlug].blocks || [])];
    blocks[i] = { ...blocks[i], ...patch };
    updateCurrent({ blocks });
  };

  const addBlock = () => {
    const blocks = [...(pages[activeSlug].blocks || []), { heading: 'New Section', body: 'Enter content here.' }];
    updateCurrent({ blocks });
  };

  const removeBlock = (i: number) => {
    const blocks = (pages[activeSlug].blocks || []).filter((_, idx) => idx !== i);
    updateCurrent({ blocks });
  };

  const moveBlock = (i: number, dir: number) => {
    const blocks = [...(pages[activeSlug].blocks || [])];
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    updateCurrent({ blocks });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pages) });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (e) {}
    setSaving(false);
  };

  const resetToDefault = () => {
    if (confirm('Reset this page to default content? Your changes will be lost.')) {
      setPages(p => ({ ...p, [activeSlug]: DEFAULT_PAGES[activeSlug] }));
    }
  };

  const current = pages[activeSlug] || { title: '', subtitle: '', blocks: [] };

  return (
    <div style={{ padding: '2rem', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Page Content</h1>
          <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>Edit the content of every public page. Changes go live instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={resetToDefault} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Reset to Default</button>
          <button onClick={save} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: saved ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
            {saving ? 'Saving...' : saved ? ' Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #2a2e3b', paddingBottom: '1rem' }}>
        {SLUGS.map(slug => (
          <button key={slug} onClick={() => setActiveSlug(slug)} style={{ padding: '0.6rem 1.25rem', background: activeSlug === slug ? '#22c55e' : '#1a1d27', color: activeSlug === slug ? '#fff' : '#8b92a5', border: '1px solid ' + (activeSlug === slug ? '#22c55e' : '#2a2e3b'), borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            {LABELS[slug]}
          </button>
        ))}
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '2rem', marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: '#8b92a5', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Page Title</label>
        <input value={current.title} onChange={e => updateCurrent({ title: e.target.value })} style={{ width: '100%', padding: '0.9rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', borderRadius: '0.5rem', color: '#fff', outline: 'none', fontSize: '1rem', marginBottom: '1.5rem' }} />

        <label style={{ display: 'block', color: '#8b92a5', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Page Subtitle</label>
        <textarea value={current.subtitle} onChange={e => updateCurrent({ subtitle: e.target.value })} rows={3} style={{ width: '100%', padding: '0.9rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', borderRadius: '0.5rem', color: '#fff', outline: 'none', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Content Blocks ({(current.blocks || []).length})</h2>
        <button onClick={addBlock} style={{ padding: '0.6rem 1.25rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>+ Add Block</button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {(current.blocks || []).map((block, i) => (
          <div key={i} style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>BLOCK {i + 1}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ padding: '0.35rem 0.75rem', background: 'transparent', color: '#8b92a5', border: '1px solid #2a2e3b', borderRadius: '0.35rem', cursor: i === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}> Up</button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === (current.blocks.length - 1)} style={{ padding: '0.35rem 0.75rem', background: 'transparent', color: '#8b92a5', border: '1px solid #2a2e3b', borderRadius: '0.35rem', cursor: i === (current.blocks.length - 1) ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}> Down</button>
                <button onClick={() => removeBlock(i)} style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
              </div>
            </div>
            <input value={block.heading} onChange={e => updateBlock(i, { heading: e.target.value })} placeholder="Section heading" style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', borderRadius: '0.5rem', color: '#fff', outline: 'none', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }} />
            <textarea value={block.body} onChange={e => updateBlock(i, { body: e.target.value })} placeholder="Section content" rows={4} style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', borderRadius: '0.5rem', color: '#e5e7eb', outline: 'none', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
