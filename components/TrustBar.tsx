'use client';
import React from 'react';

const TrustBar = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '2rem', background: '#0f1117', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937', marginBottom: '2rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>
        <span style={{ fontSize: '1.25rem' }}></span> Bank-Grade Security
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>
        <span style={{ fontSize: '1.25rem' }}></span> Instant Execution
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>
        <span style={{ fontSize: '1.25rem' }}></span> Regulated & Compliant
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>
        <span style={{ fontSize: '1.25rem' }}></span> 24/7 Support
      </div>
    </div>
  );
};

export default TrustBar;
