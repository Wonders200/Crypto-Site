'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Users, ArrowRight, Check, Sparkles } from 'lucide-react';
import { DEMO_ADMIN_CREDENTIALS, DEMO_CUSTOMER_CREDENTIALS } from '@/lib/demoStore';

export default function DemoPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const enterCustomerDemo = () => {
    setLoading('customer');
    try {
      localStorage.setItem('cs.demoMode', 'customer');
      localStorage.setItem('demo.cs.user', JSON.stringify({
        email: DEMO_CUSTOMER_CREDENTIALS.email,
        name: DEMO_CUSTOMER_CREDENTIALS.name,
        tier: DEMO_CUSTOMER_CREDENTIALS.tier,
      }));
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 200);
    } catch {
      setLoading(null);
      alert('Demo mode requires localStorage to be enabled.');
    }
  };

  const enterAdminDemo = () => {
    setLoading('admin');
    try {
      localStorage.setItem('cs.demoMode', 'admin');
      localStorage.setItem('demo.cs.admin', JSON.stringify({
        email: DEMO_ADMIN_CREDENTIALS.email,
        signedInAt: Date.now(),
      }));
      setTimeout(() => {
        window.location.href = '/admin';
      }, 200);
    } catch {
      setLoading(null);
      alert('Demo mode requires localStorage to be enabled.');
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '9999px', color: '#22c55e', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          <Sparkles size={14} /> Interactive Preview
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
          Experience <span style={{ background: 'linear-gradient(135deg, #22c55e, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ApexVault</span> Before You Buy
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#8b92a5', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Click below to explore the platform exactly as customers and admins would. Everything is fully functional  no signup required.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto 4rem' }}>
        <div style={{ background: 'linear-gradient(145deg, #1a2a1f, #1a1d27)', border: '1px solid #22c55e', borderRadius: '1.5rem', padding: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '9999px', color: '#22c55e', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            <Users size={12} /> Customer View
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>Customer Account</h2>
          <p style={{ color: '#8b92a5', lineHeight: '1.6', marginBottom: '2rem', fontSize: '0.95rem' }}>
            See the trading platform from your customer's perspective, complete with live balances, positions, and full trading functionality.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '600', marginBottom: '0.75rem' }}>What you'll explore</div>
            {['Trading dashboard with live P/L', 'Balance, deposits & withdrawals', 'Earn yield & staking products', 'KYC verification flow', 'Transaction & order history'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', color: '#d1d5db', fontSize: '0.9rem' }}>
                <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>Demo Credentials</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#22c55e', marginBottom: '0.25rem' }}>{DEMO_CUSTOMER_CREDENTIALS.email}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#22c55e' }}>{DEMO_CUSTOMER_CREDENTIALS.password}</div>
          </div>

          <button onClick={enterCustomerDemo} disabled={loading !== null}
            style={{ width: '100%', padding: '1rem', background: loading === 'customer' ? '#4ade80' : '#22c55e', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: loading !== null ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading === 'customer' ? 'Loading...' : <>Enter Customer Demo <ArrowRight size={16} /></>}
          </button>
        </div>

        <div style={{ background: 'linear-gradient(145deg, #1a1a2f, #1a1d27)', border: '1px solid #6366f1', borderRadius: '1.5rem', padding: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '9999px', color: '#818cf8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            <Shield size={12} /> Admin Console
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>Admin Account</h2>
          <p style={{ color: '#8b92a5', lineHeight: '1.6', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Explore the full admin console with user management, KYC review, transaction approvals, and site configuration.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '600', marginBottom: '0.75rem' }}>What you'll explore</div>
            {['Live dashboard with KPIs & charts', 'User management & KYC reviews', 'Transaction approvals & deductions', 'Earn products & pricing tiers', 'Site settings & audit log'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', color: '#d1d5db', fontSize: '0.9rem' }}>
                <Check size={14} style={{ color: '#818cf8', flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>Demo Credentials</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8', marginBottom: '0.25rem' }}>{DEMO_ADMIN_CREDENTIALS.email}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8' }}>{DEMO_ADMIN_CREDENTIALS.password}</div>
          </div>

          <button onClick={enterAdminDemo} disabled={loading !== null}
            style={{ width: '100%', padding: '1rem', background: loading === 'admin' ? '#818cf8' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: loading !== null ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading === 'admin' ? 'Loading...' : <>Enter Admin Demo <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto 3rem', padding: '1.5rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '1rem' }}>
        <div style={{ color: '#fca5a5', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <strong style={{ color: '#ef4444' }}>Security note:</strong> The demo uses isolated storage and separate credentials. It cannot access production data or your real admin account. Exiting the demo wipes all demo data instantly.
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #1f2937', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Demo data resets automatically. Changes you make won't affect the production database.</p>
        <Link href="/" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}> Back to home</Link>
      </div>
    </div>
  );
}
