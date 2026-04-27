import React from 'react';

export default function StaffServicePage() {
  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#334155' }}>Core Services & API Analytics</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        <div className="card" style={{ padding: '1.5rem', background: '#3b82f6', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.9 }}>AI Inference Queries</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>14.2k</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Successful Google Gemini Resolutions</div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.9 }}>Edge Nodes</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>99.9%</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Uptime on Disease Detection & Soil Maps</div>
        </div>
          
      </div>

      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
         <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>SSLCommerz Loop Stability</h4>
         <p style={{ color: '#475569', fontSize: '0.9rem' }}>
           The Sandbox Gateway simulation proxy is currently running. Incoming callbacks to the Webhook IPN are confirmed active and tracing correctly to the PostgreSQL ledger.
         </p>
      </div>

    </div>
  );
}
