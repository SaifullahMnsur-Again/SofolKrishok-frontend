import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmingAPI } from '../services/api';

export default function FarmerTracksPage() {
  const [tracks, setTracks] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [formData, setFormData] = useState({ land: '', crop_name: '', season: '', planted_date: '', expected_harvest_date: '', status: 'active' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tracksRes, landsRes] = await Promise.all([
        farmingAPI.getTracks(),
        farmingAPI.getLands()
      ]);
      setTracks(tracksRes.data.results || tracksRes.data);
      setLands(landsRes.data.results || landsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await farmingAPI.createTrack(formData);
      setShowEnroll(false);
      setFormData({ land: '', crop_name: '', season: '', planted_date: '', expected_harvest_date: '', status: 'active' });
      fetchData();
    } catch (err) {
      alert("Enrollment failed. Ensure all fields are filled.");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">🌾 Crop Tracks</h1>
          <p className="page-subtitle">Manage your seasonal crop growth lifecycles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowEnroll(true)}>
          Enroll New Track
        </button>
      </div>

      {showEnroll && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Season Enrollment</h3>
          <form onSubmit={handleEnroll} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Select Land Parcel</label>
              <select className="input" style={{ width: '100%' }} value={formData.land} onChange={e => setFormData({ ...formData, land: e.target.value })} required>
                <option value="">-- Choose Land --</option>
                {lands.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Crop Category</label>
              <input className="input" style={{ width: '100%' }} placeholder="e.g. Rice, Wheat" value={formData.crop_name} onChange={e => setFormData({ ...formData, crop_name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Season Name</label>
              <input className="input" style={{ width: '100%' }} placeholder="e.g. Winter 2026" value={formData.season} onChange={e => setFormData({ ...formData, season: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Planting Date</label>
              <input className="input" style={{ width: '100%' }} type="date" value={formData.planted_date} onChange={e => setFormData({ ...formData, planted_date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Expected Harvest</label>
              <input className="input" style={{ width: '100%' }} type="date" value={formData.expected_harvest_date} onChange={e => setFormData({ ...formData, expected_harvest_date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Crop Status</label>
              <select className="input" style={{ width: '100%' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Ongoing</option>
                <option value="harvested">Harvested</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEnroll(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Syncing Seasonal Tracks...</p> : (
        <div className="grid grid-3">
          {tracks.map(track => (
            <Link key={track.id} to={`/tracks/${track.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: '1.5rem', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--primary-color)' }}>{track.season}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: track.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    {track.status}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{track.crop_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>📍 {track.land_name || 'Land Parcel'}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  {track.planted_date ? `🌱 From ${track.planted_date}` : '🌱 Planting date not set'}
                  {' '}
                  {track.actual_harvest_date ? `to ${track.actual_harvest_date}` : track.expected_harvest_date ? `to expected ${track.expected_harvest_date}` : 'to ongoing'}
                </div>
                <div style={{ marginTop: '1.5rem', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', position: 'relative' }}>
                   <div style={{ width: track.status === 'active' ? '40%' : '5%', height: '100%', background: 'var(--primary-color)', borderRadius: '3px' }}></div>
                </div>
                <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.75rem', opacity: 0.8 }}>
                  Track Details →
                </div>
              </div>
            </Link>
          ))}
          {tracks.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.6 }}>No seasonal tracks found. Enroll a land parcel to begin.</p>}
        </div>
      )}
    </div>
  );
}
