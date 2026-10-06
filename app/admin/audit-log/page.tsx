'use client';
import React, { useState } from 'react';
const initialLogs = [
  { id: 1, time: '2026-10-24 14:32:18', actor: 'admin@apexvault.io', action: 'UPDATE', resource: 'Site Settings', detail: 'Changed siteName to ApexVault', ip: '10.0.0.1' },
  { id: 2, time: '2026-10-24 14:15:02', actor: 'admin@apexvault.io', action: 'APPROVE', resource: 'KYC Request', detail: 'Approved KYC for sarah.m@example.com', ip: '10.0.0.1' },
  { id: 3, time: '2026-10-24 13:48:55', actor: 'system', action: 'AUTO', resource: 'Earn Position', detail: 'Auto-matured position POS-1004', ip: 'internal' },
  { id: 4, time: '2026-10-24 13:12:34', actor: 'admin@apexvault.io', action: 'DELETE', resource: 'News Article', detail: 'Deleted "Old announcement"', ip: '10.0.0.1' },
  { id: 5, time: '2026-10-24 12:45:09', actor: 'admin@apexvault.io', action: 'CREATE', resource: 'Earn Product', detail: 'Created USDC Flexible pool', ip: '10.0.0.1' },
  { id: 6, time: '2026-10-24 12:20:41', actor: 'sarah.m@example.com', action: 'LOGIN', resource: 'Session', detail: 'Successful login from Chrome/macOS', ip: '82.14.201.55' },
  { id: 7, time: '2026-10-24 11:55:17', actor: 'admin@apexvault.io', action: 'SUSPEND', resource: 'User Account', detail: 'Suspended james.k@example.com', ip: '10.0.0.1' },
  { id: 8, time: '2026-10-24 11:30:22', actor: 'system', action: 'ALERT', resource: 'Security', detail: 'Multiple failed login attempts for michael.t@example.com', ip: '45.12.8.221' },
  { id: 9, time: '2026-10-24 10:15:38', actor: 'admin@apexvault.io', action: 'CONFIG', resource: 'Fee Schedule', detail: 'Adjusted maker fee to 0.10%', ip: '10.0.0.1' },
  { id: 10, time: '2026-10-24 09:42:11', actor: 'admin@apexvault.io', action: 'UPDATE', resource: 'Page Content', detail: 'Updated About page mission statement', ip: '10.0.0.1' },
];
const actionColors = { UPDATE: '#6366f1', APPROVE: '#22c55e', AUTO: '#8b5cf6', DELETE: '#ef4444', CREATE: '#10b981', LOGIN: '#3b82f6', SUSPEND: '#f59e0b', ALERT: '#ef4444', CONFIG: '#f59e0b' };
export default function AuditLogPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const actions = ['All', 'UPDATE', 'APPROVE', 'CREATE', 'DELETE', 'LOGIN', 'ALERT', 'CONFIG'];
  const filtered = logs.filter(l => {
    const matchesSearch = l.actor.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'All' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });
  return (
    <div style={{ padding: '2rem', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Audit Log</h1>
        <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>Immutable record of all admin and system actions. Retained for 7 years.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#1a1d27', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #2a2e3b' }}>
        <input type="text" placeholder="Search by actor or detail..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ background: '#0f1117', border: '1px solid #2a2e3b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', outline: 'none', cursor: 'pointer' }}>
          {actions.map(a => <option key={a} value={a}>{a === 'All' ? 'All actions' : a}</option>)}
        </select>
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Timestamp</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Actor</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Action</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Resource</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Detail</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.85rem' }}>{l.time}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', fontWeight: '600', fontSize: '0.9rem' }}>{l.actor}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}><span style={{ padding: '0.25rem 0.75rem', background: (actionColors[l.action] || '#6b7280') + '20', color: actionColors[l.action] || '#6b7280', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: '700' }}>{l.action}</span></td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#9ca3af', fontSize: '0.9rem' }}>{l.resource}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#d1d5db', fontSize: '0.9rem' }}>{l.detail}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.85rem' }}>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}