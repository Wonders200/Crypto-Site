'use client';
import React, { useState } from 'react';
const initialProducts: any[] = [];
export default function AdminEarnProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const handleToggle = (id) => { setProducts(products.map(p => p.id === id ? { ...p, status: p.status === 'Live' ? 'Paused' : 'Live' } : p)); };
  const handleDelete = (id) => { if (confirm('Delete this product?')) setProducts(products.filter(p => p.id !== id)); };
  return (
    <div style={{ padding: '2rem', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Earn Products</h1>
          <p style={{ color: '#8b92a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>{products.length} products  {products.filter(p => p.status === 'Live').length} live</p>
        </div>
        <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>+ New Product</button>
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2a2e3b', borderRadius: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>APY</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Min Deposit</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Lock-up</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Risk</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Subscribed</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #2a2e3b', minWidth: '260px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', fontWeight: '600' }}>{p.name}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#22c55e', fontWeight: '700' }}>{p.apy}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', color: '#9ca3af' }}>{p.minDeposit}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>{p.lock}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: p.risk === 'Low' ? 'rgba(34,197,94,0.15)' : p.risk === 'Medium' ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)', color: p.risk === 'Low' ? '#22c55e' : p.risk === 'Medium' ? '#facc15' : '#ef4444', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>{p.risk}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b', fontWeight: '600' }}>{p.subscribed}</td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}><span style={{ color: p.status === 'Live' ? '#22c55e' : '#f59e0b', fontWeight: '600', fontSize: '0.9rem' }}>{p.status}</span></td>
                <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2a2e3b' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ background: 'transparent', border: '1px solid #334155', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleToggle(p.id)} style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer' }}>{p.status === 'Live' ? 'Pause' : 'Activate'}</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}