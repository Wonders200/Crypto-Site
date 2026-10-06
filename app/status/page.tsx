'use client';
import React from 'react';
import { usePageContent } from '@/lib/usePageContent';

export default function StatusPage() {
  const { content } = usePageContent('status');

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid #2a2e3b', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.02em', lineHeight: '1.1' }}>{content.title}</h1>
        <p style={{ fontSize: '1.2rem', color: '#8b92a5', lineHeight: '1.7', maxWidth: '800px' }}>{content.subtitle}</p>
      </div>

      {content.blocks && content.blocks.length > 0 && (
        <div style={{ display: 'grid', gap: '2.5rem' }}>
          {content.blocks.map((block, i) => (
            <div key={i} style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '2rem 2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#fff' }}>{block.heading}</h2>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{block.body}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '4rem', textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid #2a2e3b' }}>
        <a href="/" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: '600' }}> Back to Home</a>
      </div>
    </div>
  );
}
