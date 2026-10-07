'use client';
import React, { useState } from 'react';

const initialUsers: any[] = [];

export default function KycPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAutoAccept = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'VERIFIED', updated: 'Just now' } : u));
    alert('Customer KYC automatically accepted and verified.');
  };

  const handleForceRequest = (id) => {
    if (confirm('Are you sure you want to force this specific customer to re-submit their KYC documents?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'PENDING', files: 0, fileUrls: [], updated: 'Just now' } : u));
      alert('KYC request forced for this customer. They have been notified via email.');
    }
  };

  const handleReject = (id) => {
    if (confirm('Are you sure you want to reject this customer\'s KYC?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'REJECTED', updated: 'Just now' } : u));
      alert('Customer KYC has been rejected.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter(u => u.status === 'PENDING').length;
  const verifiedCount = users.filter(u => u.status === 'VERIFIED').length;
  const unverifiedCount = users.filter(u => u.status === 'UNVERIFIED').length;
  const rejectedCount = users.filter(u => u.status === 'REJECTED').length;

  return (
    <div style={{ padding: '2rem', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>KYC Reviews</h1>
        <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>{users.length} customers {pendingCount} pending {verifiedCount} verified</p>
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
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Updated</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b', minWidth: '360px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
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
                    background: u.status === 'VERIFIED' ? 'rgba(34,197,94,0.15)' : u.status === 'PENDING' ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)',
                    color: u.status === 'VERIFIED' ? '#22c55e' : u.status === 'PENDING' ? '#facc15' : '#ef4444'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#9ca3af' }}>{u.updated}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                    
                    {u.files > 0 && (
                      <button onClick={() => setSelectedUser(u)} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>View Docs</button>
                    )}

                    {u.status !== 'VERIFIED' && (
                      <button onClick={() => handleAutoAccept(u.id)} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Auto-Accept</button>
                    )}

                    {/* Force KYC button now appears for EVERY customer */}
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

      {/* DOCUMENT VIEWER MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', padding: '2rem', width: '800px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #2a2e3b', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{selectedUser.name}'s Documents</h3>
                <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedUser.email} | {selectedUser.document}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {selectedUser.fileUrls.map((file, idx) => (
                <div key={idx} style={{ background: '#0f1117', border: '1px dashed #4b5563', borderRadius: '0.75rem', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>{file === 'selfie' ? '' : ''}</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{file.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#4b5563' }}>(Document Preview)</span>
                </div>
              ))}
              {selectedUser.fileUrls.length === 0 && (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No files uploaded yet.</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #2a2e3b', paddingTop: '1.5rem' }}>
              <button onClick={() => { handleReject(selectedUser.id); setSelectedUser(null); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Reject KYC</button>
              <button onClick={() => { handleAutoAccept(selectedUser.id); setSelectedUser(null); }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Approve & Verify</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}