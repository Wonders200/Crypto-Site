'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DemoBanner() {
  const [mode, setMode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
    if (typeof window === 'undefined') return;

    // Show a "Read-only demo" toast when someone tries to edit
    const onAttempt = () => {
      setToast('Read-only demo  changes are disabled. Buy the site to unlock full editing.');
      setTimeout(() => setToast(null), 3500);
    };
    window.addEventListener('demo:readonly-attempt', onAttempt);
    // Store the handler so cleanup works
    (window as any).__demoReadonlyHandler = onAttempt;
    const update = () => {
      const m = localStorage.getItem('cs.demoMode');
      setMode(m);
      if (m) document.body.classList.add('demo-mode-active');
      else document.body.classList.remove('demo-mode-active');
    };
    update();
    window.addEventListener('storage', update);
    const t = setInterval(update, 800);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('demo:readonly-attempt', (window as any).__demoReadonlyHandler);
      clearInterval(t);
      document.body.classList.remove('demo-mode-active');
    };
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const m = localStorage.getItem('cs.demoMode');
    setMode(m);
    if (m) document.body.classList.add('demo-mode-active');
  }, [pathname, hydrated]);

  if (!hydrated || !mode || pathname === '/demo') return null;

  const exitDemo = () => {
    localStorage.removeItem('cs.demoMode');
    localStorage.removeItem('demo.cs.store');
    localStorage.removeItem('demo.cs.user');
    localStorage.removeItem('demo.cs.admin');
    document.body.classList.remove('demo-mode-active');
    window.location.href = '/demo';
  };

  const isAdmin = mode === 'admin';
  const bgGradient = isAdmin
    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
    : 'linear-gradient(90deg, #22c55e, #16a34a)';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: bgGradient, color: '#fff', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '13px', fontWeight: 600,
      boxShadow: '0 2px 16px rgba(0,0,0,0.4)', fontFamily: 'sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ background: 'rgba(255,255,255,0.22)', padding: '3px 10px', borderRadius: '5px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Demo Mode</span>
        <span>You are viewing ApexVault as a <strong>{isAdmin ? 'Administrator' : 'Customer'}</strong></span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Read-only demo  credentials are fixed</span>
        <button onClick={exitDemo} style={{ background: '#fff', border: 'none', color: isAdmin ? '#6366f1' : '#16a34a', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Exit Demo</button>
      </div>
      {toast && (
        <div style={{
          position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
          background: '#0f1117', color: '#fff', padding: '12px 20px',
          border: '1px solid ' + (isAdmin ? '#6366f1' : '#22c55e'),
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '13px', fontWeight: 600, zIndex: 100000,
        }}>{toast}</div>
      )}
    </div>
  );
}
