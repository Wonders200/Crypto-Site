'use client';
import React, { useState } from 'react';

const assets = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'BTC', minDeposit: '0.00001 Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', network: 'ERC-20', minDeposit: '0.01 Ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', color: '#627EEA' },
  { symbol: 'USDT', name: 'Tether', network: 'TRC-20', minDeposit: '10 Tether', address: 'TN9RRaXkCFtN9RRaXkCFtN9RRaXkCFtN9RR', color: '#26A17B' },
];

export default function DepositPage() {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedAsset.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', background: '#0f1117', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Deposit Crypto</h1>
        <p style={{ color: '#8b92a5', fontSize: '1.1rem' }}>Select an asset to generate your deposit address.</p>
      </div>

      {/* Asset Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            style={{
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: selectedAsset.symbol === asset.symbol ? '1px solid #22c55e' : '1px solid #2a2e3b',
              background: selectedAsset.symbol === asset.symbol ? 'rgba(34,197,94,0.1)' : '#1a1d27',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: asset.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{asset.symbol.charAt(0)}</span>
            {asset.name}
          </button>
        ))}
      </div>

      {/* Deposit Card */}
      <div style={{ background: '#1a1d27', borderRadius: '1rem', border: '1px solid #2a2e3b', padding: '2rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ color: '#8b92a5', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Deposit Address ({selectedAsset.network} Network)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', wordBreak: 'break-all', fontFamily: 'monospace' }}>{selectedAsset.address}</div>
          </div>
          <button onClick={handleCopy} style={{ background: copied ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Warning 1: Supported Networks (Exact Styling Match) */}
        <div style={{ 
          background: '#2D1E12', 
          border: '1px solid #4A2E0C', 
          borderRadius: '1rem', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div style={{ color: '#F59E0B', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '-0.2rem' }}></div>
          <div style={{ color: '#F59E0B', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Please note that only supported networks are shown, if you deposit via another network, your coins may be lost.
          </div>
        </div>

        {/* Warning 2: Important Details (Exact Styling Match) */}
        <div style={{ borderTop: '1px solid #2a2e3b', paddingTop: '2rem' }}>
          <div style={{ 
            display: 'inline-block', 
            background: '#4A2E0C', 
            color: '#F59E0B', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '9999px', 
            fontWeight: '700', 
            fontSize: '0.9rem', 
            letterSpacing: '0.05em',
            marginBottom: '1.5rem' 
          }}>
            Important
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#E5E7EB', fontSize: '1.05rem', lineHeight: '1.8' }}>
            <li style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#6B7280', fontSize: '1.2rem', lineHeight: '1' }}></span>
              <span>Minimum deposit of <strong style={{ color: '#fff' }}>{selectedAsset.minDeposit}</strong></span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#6B7280', fontSize: '1.2rem', lineHeight: '1' }}></span>
              <span>Send only <strong style={{ color: '#fff' }}>{selectedAsset.name} via the {selectedAsset.network}</strong> network to this deposit address</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#6B7280', fontSize: '1.2rem', lineHeight: '1' }}></span>
              <span>Sending coins or tokens other than <strong style={{ color: '#fff' }}>{selectedAsset.name}</strong> to this address may result in the loss of your deposit</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}