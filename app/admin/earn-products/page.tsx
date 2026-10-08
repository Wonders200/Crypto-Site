'use client';
import React, { useState } from 'react';
import { useAdminStore, useToast } from '@/app/providers';
import { AdminEarnProduct, uid } from '@/lib/adminStore';
import { formatCurrency } from '@/lib/format';
import { Plus, Pencil, Trash2, Pause, Play, X } from 'lucide-react';

const emptyProduct = (): AdminEarnProduct => ({
  id: '', asset: '', tier: 'Flexible', apy: 5, minDeposit: 200, lockup: 'None',
  payout: 'Daily', enabled: true, risk: 'Low', order: Date.now(),
} as any);

const toProduct = (p: any) => ({
  ...p,
  risk: p.risk === 'Med' ? 'Med' : (p.risk || 'Low'),
});

export default function AdminEarnProductsPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<AdminEarnProduct | null>(null);
  const [isNew, setIsNew] = useState(false);

  const products = (store.earnProducts ?? []).slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  const liveCount = products.filter((p: any) => p.enabled).length;

  const startNew = () => {
    setEditing(emptyProduct());
    setIsNew(true);
  };
  const startEdit = (p: AdminEarnProduct) => {
    setEditing({ ...p } as any);
    setIsNew(false);
  };
  const close = () => { setEditing(null); setIsNew(false); };
  const setField = (k: string, v: any) => setEditing(prev => prev ? { ...prev, [k]: v } : prev);

  const save = () => {
    if (!editing) return;
    if (!editing.asset?.trim()) { push({ kind: 'error', title: 'Asset symbol required' }); return; }
    if (!editing.apy || editing.apy <= 0) { push({ kind: 'error', title: 'APY must be > 0' }); return; }

    if (isNew) {
      const p = { ...editing, id: editing.id || uid('ep_' + Date.now()), order: editing.order ?? Date.now() };
      update('earnProducts', [...products, p] as any);
      log('CREATE', 'Earn product: ' + p.asset);
      push({ kind: 'success', title: 'Product created' });
    } else {
      update('earnProducts', products.map((x: any) => x.id === editing.id ? editing : x) as any);
      log('UPDATE', 'Earn product: ' + editing.asset);
      push({ kind: 'success', title: 'Product updated' });
    }
    close();
  };

  const toggleEnabled = (p: AdminEarnProduct) => {
    const next = !p.enabled;
    update('earnProducts', products.map((x: any) => x.id === p.id ? { ...x, enabled: next } : x) as any);
    log(next ? 'EARN_ENABLE' : 'EARN_DISABLE', 'Earn product: ' + p.asset);
    push({ kind: 'success', title: next ? 'Product activated' : 'Product paused' });
  };

  const remove = (p: AdminEarnProduct) => {
    if (!confirm('Delete ' + p.asset + ' ' + p.tier + '?')) return;
    update('earnProducts', products.filter((x: any) => x.id !== p.id) as any);
    log('DELETE', 'Earn product: ' + p.asset);
    push({ kind: 'success', title: 'Product deleted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Earn Products</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{products.length} products  {liveCount} live</p>
        </div>
        <button onClick={startNew} className="btn btn-primary text-sm">
          <Plus size={14} /> New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="panel p-12 text-center" style={{ color: 'var(--muted)' }}>
          No products yet. Click "New Product" to add your first one.
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Asset</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Tier</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>APY</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Min</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Lock-up</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Risk</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-semibold">{p.asset}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>{p.tier}</td>
                  <td className="py-3 px-4 mono font-bold" style={{ color: 'var(--green)' }}>{p.apy}%</td>
                  <td className="py-3 px-4 mono">{formatCurrency(p.minDeposit ?? 200)}</td>
                  <td className="py-3 px-4">{p.lockup || 'None'}</td>
                  <td className="py-3 px-4">
                    <span className="pill" style={{
                      background: p.risk === 'Low' ? 'rgba(34,197,94,0.15)' : p.risk === 'Med' ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)',
                      color: p.risk === 'Low' ? 'var(--green)' : p.risk === 'Med' ? '#facc15' : 'var(--red)',
                    }}>{p.risk}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: p.enabled ? 'var(--green)' : 'var(--amber)', fontWeight: 600 }}>
                      {p.enabled ? 'Live' : 'Paused'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(p)} className="btn btn-ghost text-xs">
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => toggleEnabled(p)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1"
                        style={{ background: p.enabled ? 'rgba(250,204,21,0.1)' : 'rgba(34,197,94,0.1)', color: p.enabled ? '#facc15' : 'var(--green)', border: '1px solid ' + (p.enabled ? 'rgba(250,204,21,0.3)' : 'rgba(34,197,94,0.3)') }}>
                        {p.enabled ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Activate</>}
                      </button>
                      <button onClick={() => remove(p)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1"
                        style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)' }}>
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={close}>
          <div className="panel w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="font-semibold">{isNew ? 'New Earn Product' : 'Edit Earn Product'}</div>
              <button onClick={close} className="p-1.5 rounded hover:bg-white/5"><X size={16} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Asset symbol</div>
                <input value={editing.asset} onChange={e => setField('asset', e.target.value.toUpperCase())}
                  placeholder="USDC" className="input w-full mono" />
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Tier</div>
                <select value={editing.tier} onChange={e => setField('tier', e.target.value)} className="input w-full">
                  <option value="Flexible">Flexible</option>
                  <option value="Staking">Staking</option>
                  <option value="Locked">Locked</option>
                </select>
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>APY %</div>
                <input type="number" step="0.01" value={editing.apy} onChange={e => setField('apy', parseFloat(e.target.value) || 0)}
                  className="input w-full mono" />
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Min deposit ($)</div>
                <input type="number" value={editing.minDeposit} onChange={e => setField('minDeposit', parseFloat(e.target.value) || 0)}
                  className="input w-full mono" />
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Lock-up</div>
                <input value={editing.lockup} onChange={e => setField('lockup', e.target.value)}
                  placeholder="None / 30 Days / 90 Days" className="input w-full" />
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Payout</div>
                <input value={editing.payout} onChange={e => setField('payout', e.target.value)}
                  placeholder="Daily / Monthly" className="input w-full" />
              </label>
              <label className="col-span-1">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Risk</div>
                <select value={editing.risk} onChange={e => setField('risk', e.target.value)} className="input w-full">
                  <option value="Low">Low</option>
                  <option value="Med">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="col-span-1 flex items-center gap-2 mt-5">
                <input type="checkbox" checked={editing.enabled} onChange={e => setField('enabled', e.target.checked)} />
                <span className="text-sm">Enabled (visible to customers)</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
              <button onClick={close} className="btn btn-ghost text-sm">Cancel</button>
              <button onClick={save} className="btn btn-primary text-sm">{isNew ? 'Create Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}