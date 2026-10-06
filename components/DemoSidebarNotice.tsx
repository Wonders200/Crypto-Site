'use client';
import { useEffect, useState } from 'react';

export default function DemoSidebarNotice() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDemo(window.location.port === '3002');
    }
  }, []);

  if (!isDemo) return null;

  return (
    <div style={{
      margin: '14px 14px 10px 14px',
      padding: '12px 14px',
      background: 'rgba(99,102,241,0.10)',
      border: '1px solid rgba(99,102,241,0.4)',
      borderRadius: '10px',
      color: '#818cf8',
      fontSize: '11px',
      lineHeight: 1.5,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      fontFamily: 'sans-serif',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>
        <strong style={{ display: 'block', marginBottom: '3px', color: '#a5b4fc', fontSize: '11px' }}>Read-only demo</strong>
        Admin credentials and store backup are hidden for security. Buy the site to unlock full editing.
      </span>
    </div>
  );
}
