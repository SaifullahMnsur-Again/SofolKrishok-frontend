import React, { useState } from 'react';

export default function FarmerProfitLossPage() {
  const [data, setData] = useState({
    cropType: 'rice',
    areaAcres: 1,
    seedCost: 0,
    fertilizerCost: 0,
    laborCost: 0,
    expectedYieldKgPerAcre: 0,
    sellingPricePerKg: 0,
  });

  const totalCost = Number(data.seedCost) + Number(data.fertilizerCost) + Number(data.laborCost);
  const totalRevenue = Number(data.areaAcres) * Number(data.expectedYieldKgPerAcre) * Number(data.sellingPricePerKg);
  const profit = totalRevenue - totalCost;

  return (
    <div>
      <h2 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Profit & Loss Forecaster</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Estimate your harvest returns based on active local market projections and immediate expenditures.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        
        {/* Left Col: Inputs */}
        <div className="card glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Parameters</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Crop Category</label>
              <select className="input" style={{ width: '100%' }} value={data.cropType} onChange={e => setData({...data, cropType: e.target.value})}>
                <option value="rice">Rice / Paddy</option>
                <option value="wheat">Wheat</option>
                <option value="potato">Potato</option>
                <option value="jute">Jute</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Area (Acres)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.areaAcres} onChange={e => setData({...data, areaAcres: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Seed Cost (৳)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.seedCost} onChange={e => setData({...data, seedCost: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Fertilizer Cost (৳)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.fertilizerCost} onChange={e => setData({...data, fertilizerCost: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Labor Cost (৳)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.laborCost} onChange={e => setData({...data, laborCost: e.target.value})} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Exp. Yield (kg/acre)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.expectedYieldKgPerAcre} onChange={e => setData({...data, expectedYieldKgPerAcre: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Sell Price (৳/kg)</label>
                <input type="number" className="input" style={{ width: '100%' }} value={data.sellingPricePerKg} onChange={e => setData({...data, sellingPricePerKg: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Expenditure</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#ef4444' }}>
              - ৳{totalCost.toLocaleString()}
            </div>
          </div>

          <div className="card glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Gross Revenue</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
              + ৳{totalRevenue.toLocaleString()}
            </div>
          </div>

          <div className="card glass-card" style={{ padding: '1.5rem', border: `2px solid ${profit >= 0 ? 'var(--primary-color)' : '#ef4444'}`, background: profit >= 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Net Profit Projection</h3>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: profit >= 0 ? 'var(--primary-color)' : '#ef4444' }}>
              {profit >= 0 ? '+' : ''} ৳{profit.toLocaleString()}
            </div>
            {profit > 0 && <p style={{ color: 'var(--primary-color)', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Highly viable planting strategy!</p>}
            {profit < 0 && <p style={{ color: '#ef4444', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Warning: Projected Yield results in net loss.</p>}
          </div>

        </div>

      </div>
    </div>
  );
}
