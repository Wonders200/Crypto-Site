'use client';
import React, { useState, useMemo } from 'react';
import { useAdminStore, useToast } from '@/app/providers';
import { uid, AdminUser, KycStatus } from '@/lib/adminStore';
import { formatCurrency } from '@/lib/format';

const toDate = (ts: number) => { const d = new Date(ts || Date.now()); const p = (n: number) => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; };
const fromDate = (s: string) => s ? new Date(s + "T12:00:00").getTime() : Date.now();

export default function KycPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [backdating, setBackdating] = useState<AdminUser | null>(null);
  const [backdateDate, setBackdateDate] = useState<string>(toDate(Date.now()));
  const [backdateStatus, setBackdateStatus] = useState<KycStatus>('verified');

  // Build a display list: every store user + their latest KYC submission (if any)
  const rows = useMemo(() => {
    return store.users.map(u => {
      const submissions = (store.kycSubmissions ?? []).filter((k: any) => k.userId === u.id);
      const latest = submissions.sort((a: any, b: any) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))[0];
      const status = (u.kycStatus ?? "unverified").toUpperCase();
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        country: latest?.country ?? "",
        document: latest?.documentType ?? "",
        files: latest?.fileUrls?.length ?? 0,
        fileUrls: latest?.fileUrls ?? [],
        status,
        updated: latest?.submittedAt ? new Date(latest.submittedAt).toLocaleDateString() : "",
        updatedAt: latest?.submittedAt ?? u.createdAt,
        user: u,
      };
    }).filter(r => {
      const term = searchTerm.trim().toLowerCase();
      if (term && !r.name.toLowerCase().includes(term) && !r.email.toLowerCase().includes(term)) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter.toUpperCase()) return false;
      return true;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [store.users, store.kycSubmissions, searchTerm, statusFilter]);

  const updateUserKyc = (userId: string, newStatus: KycStatus, extra?: { submittedAt?: number; note?: string }) => {
    update("users", store.users.map(u => u.id === userId
      ? { ...u, kycStatus: newStatus, kycVerified: newStatus === "verified" }
      : u));
    if (extra?.submittedAt) {
      // Create or update a KYC submission record with the custom date
      const existing = (store.kycSubmissions ?? []).find((k: any) => k.userId === userId);
      if (existing) {
        update("kycSubmissions", (store.kycSubmissions ?? []).map((k: any) => k.userId === userId
          ? { ...k, status: newStatus, reviewedAt: Date.now(), submittedAt: extra.submittedAt }
          : k));
      } else {
        update("kycSubmissions", [{
          id: uid("k"),
          userId,
          status: newStatus,
          submittedAt: extra.submittedAt,
          reviewedAt: Date.now(),
          note: extra.note,
        } as any, ...(store.kycSubmissions ?? [])]);
      }
    }
  };

  const handleAutoAccept = (userId: string) => {
    updateUserKyc(userId, "verified");
    log("KYC_APPROVE", "User " + userId);
    push({ kind: "success", title: "KYC approved" });
  };

  const handleForceRequest = (userId: string) => {
    if (!confirm("Force this customer to re-submit KYC?")) return;
    updateUserKyc(userId, "pending");
    update("kycSubmissions", (store.kycSubmissions ?? []).filter((k: any) => k.userId !== userId));
    log("KYC_FORCE", "User " + userId);
    push({ kind: "success", title: "KYC re-requested" });
  };

  const handleReject = (userId: string) => {
    if (!confirm("Reject this customer's KYC?")) return;
    updateUserKyc(userId, "rejected");
    log("KYC_REJECT", "User " + userId);
    push({ kind: "success", title: "KYC rejected" });
  };

  const openBackdate = (user: AdminUser, defaultStatus: KycStatus = "verified") => {
    setBackdating(user);
    setBackdateDate(toDate(Date.now()));
    setBackdateStatus(defaultStatus);
  };

  const submitBackdate = () => {
    if (!backdating) return;
    const ts = fromDate(backdateDate);
    updateUserKyc(backdating.id, backdateStatus, { submittedAt: ts });
    log("KYC_BACKDATE", "User " + backdating.id, "Set " + backdateStatus + " at " + backdateDate);
    push({ kind: "success", title: "KYC date updated to " + backdateDate });
    setBackdating(null);
  };

  const pendingCount = rows.filter(r => r.status === 'PENDING').length;
  const verifiedCount = rows.filter(r => r.status === 'VERIFIED').length;
  const unverifiedCount = rows.filter(r => r.status === 'UNVERIFIED').length;
  const rejectedCount = rows.filter(r => r.status === 'REJECTED').length;

  return (
    <div style={{ padding: '2rem', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>KYC Reviews</h1>
        <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          {store.users.length} customers  {pendingCount} pending  {verifiedCount} verified
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1a1d27', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #2a2e3b' }}>
          <div style={{ color: '#8b92a5', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Review</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#facc15' }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#1a1d27', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #2a2e3b' }}>
          <div style={{ color: '#8b92a5', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Verified</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#22c55e' }}>{verifiedCount}</div>
        </div>
        <div style={{ background: '#1a1d27', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #2a2e3b' }}>
          <div style={{ color: '#8b92a5', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Unverified</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff' }}>{unverifiedCount}</div>
        </div>
        <div style={{ background: '#1a1d27', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #2a2e3b' }}>
          <div style={{ color: '#8b92a5', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Rejected</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ef4444' }}>{rejectedCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#1a1d27', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #2a2e3b' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem', outline: 'none', width: '300px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ background: '#0f1117', border: '1px solid #2a2e3b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="All">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
      </div>

      <div style={{ background: '#1a1d27', borderRadius: '1rem', border: '1px solid #2a2e3b', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b', minWidth: '250px' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Country</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Document</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Files</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Submitted</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b', minWidth: '420px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No customers match the current filters.</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#2a2e3b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#22c55e', flexShrink: 0 }}>{u.name.charAt(0)}</div>
                    <div><div style={{ fontWeight: '600' }}>{u.name}</div><div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{u.email}</div></div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>{u.country}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>{u.document}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>{u.files > 0 ? u.files : 'none'}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                    background: u.status === 'VERIFIED' ? 'rgba(34,197,94,0.15)' : u.status === 'PENDING' ? 'rgba(250,204,21,0.15)' : u.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)',
                    color: u.status === 'VERIFIED' ? '#22c55e' : u.status === 'PENDING' ? '#facc15' : u.status === 'REJECTED' ? '#ef4444' : '#9ca3af'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#9ca3af' }}>{u.updated}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {u.files > 0 && (
                      <button onClick={() => setSelectedUser(u.user)} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>View Docs</button>
                    )}
                    {u.status !== 'VERIFIED' && (
                      <button onClick={() => handleAutoAccept(u.id)} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Auto-Accept</button>
                    )}
                    <button onClick={() => openBackdate(u.user)} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Backdate</button>
                    <button onClick={() => handleForceRequest(u.id)} style={{ background: 'transparent', color: '#facc15', border: '1px solid #facc15', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Force KYC</button>
                    {u.status !== 'REJECTED' && (
                      <button onClick={() => handleReject(u.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Reject</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Document Viewer Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '2rem', width: '800px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #2a2e3b', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{selectedUser.name}'s Documents</h3>
                <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}></button>
            </div>
            <div style={{ textAlign: 'center', color: '#8b92a5', padding: '3rem 1rem' }}>
              No documents on file. Use Force KYC to request documents.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #2a2e3b', paddingTop: '1.5rem' }}>
              <button onClick={() => { handleReject(selectedUser.id); setSelectedUser(null); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Reject KYC</button>
              <button onClick={() => { handleAutoAccept(selectedUser.id); setSelectedUser(null); }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Approve &amp; Verify</button>
            </div>
          </div>
        </div>
      )}

      {/* Backdate Modal */}
      {backdating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '2rem', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Backdate KYC</h3>
            <p style={{ color: '#8b92a5', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{backdating.name}  {backdating.email}</p>

            <label style={{ display: 'block', color: '#8b92a5', fontSize: '0.85rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Submission date</label>
            <input type="date" value={backdateDate} onChange={e => setBackdateDate(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', color: '#fff', borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem', marginBottom: '1rem' }} />

            <label style={{ display: 'block', color: '#8b92a5', fontSize: '0.85rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>New KYC status</label>
            <select value={backdateStatus} onChange={e => setBackdateStatus(e.target.value as KycStatus)}
              style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f1117', border: '1px solid #2a2e3b', color: '#fff', borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="unverified">Unverified</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setBackdating(null)} style={{ background: 'transparent', color: '#8b92a5', border: '1px solid #2a2e3b', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitBackdate} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}