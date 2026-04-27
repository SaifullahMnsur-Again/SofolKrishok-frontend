import React from 'react';

export default function MarketPredictionPage() {
  const predictions = [
    { crop: 'Rice', current: '৳2,400', nextMonth: '৳2,650', trend: 'up', confidence: '85%' },
    { crop: 'Potato', current: '৳1,800', nextMonth: '৳1,600', trend: 'down', confidence: '70%' },
    { crop: 'Onion', current: '৳3,200', nextMonth: '৳4,500', trend: 'up', confidence: '92%' },
    { crop: 'Mango', current: '৳4,000', nextMonth: '৳3,800', trend: 'down', confidence: '60%' },
  ];

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">📊 Market Insights & Predictions</h1>
      <p className="page-subtitle">AI-driven price forecasting based on NASA POWER climate data and historical trends.</p>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        {/* Trend Overview */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Next Month Forecast</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {predictions.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.crop}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence: {p.confidence}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: p.trend === 'up' ? '#10b981' : '#ef4444' }}>
                    {p.trend === 'up' ? '↗️' : '↘️'} {p.nextMonth}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Current: {p.current}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Climate Correlation */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Climate Correlation</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Our models have detected a **2.4°C increase** in projected soil temperature for the Rajshahi region over the next 3 weeks.
            This correlates with a **15% supply drop** in Onion yields, likely driving the projected price surge.
          </p>
          <div style={{ marginTop: '2rem', height: '150px', background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '8px', border: '1px dashed #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontSize: '0.85rem' }}>
             (Live Climate Chart Rendering...)
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
         <h4>Smart Insight</h4>
         <p style={{ opacity: 0.8 }}>Based on current trends, we recommend harvesting your <strong>Potato</strong> crop within the next 10 days to capture the current price peak before the seasonal dip.</p>
         <button className="btn btn-primary" style={{ marginTop: '1rem' }}>View Full Dataset</button>
      </div>
    </div>
  );
}
