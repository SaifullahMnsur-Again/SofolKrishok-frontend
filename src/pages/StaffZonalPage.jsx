import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function StaffZonalPage() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const zones = ['Rajshahi-North', 'Rajshahi-South', 'Dhaka-Central', 'Dhaka-West', 'Sylhet-TeaGardens', 'Chittagong-Hills', 'Barisal-Coastal'];

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getUsers();
      // Filter for experts only
      const expertList = (data.results || data).filter(u => u.role === 'expert');
      setExperts(expertList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleZoneChange = async (userId, newZone) => {
    try {
      await authAPI.updateZone(userId, newZone);
      setExperts(experts.map(e => e.id === userId ? { ...e, zone: newZone } : e));
    } catch (err) {
      alert("Failed to update zonal assignment.");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h3 style={{ marginTop: 0, color: '#334155' }}>Agricultural Zonal Management 🗺️</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Allocate expert resources across Bangladesh's agricultural service clusters to optimize coverage and responsiveness.
      </p>

      {loading ? <p>Mapping expert resources...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {experts.map(e => (
            <div key={e.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🩺
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Dr. {e.first_name || e.username}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>Total Consultations: {Math.floor(Math.random() * 50)}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Assigned Zone:</label>
                  <select 
                    className="input" 
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    value={e.zone || ''}
                    onChange={(e) => handleZoneChange(e.target.id, e.target.value)}
                    id={e.id}
                  >
                    <option value="">Unassigned</option>
                    {zones.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {experts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
          <p style={{ color: '#64748b' }}>No active experts found in the registry to assign.</p>
        </div>
      )}
    </div>
  );
}
