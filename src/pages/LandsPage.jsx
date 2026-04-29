import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmingAPI } from '../services/api';

export default function LandsPage() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', area_acres: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [expandedHistoryLandId, setExpandedHistoryLandId] = useState(null);
  const [historyByLandId, setHistoryByLandId] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  useEffect(() => {
    loadLands();
  }, []);

  const loadLands = async () => {
    try {
      const { data } = await farmingAPI.getLands();
      setLands(data.results || data);
    } catch (error) {
      console.error('Failed to load lands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: createdLand } = await farmingAPI.createLand(form);
      setForm({ name: '', location: '', area_acres: '', notes: '' });
      setShowForm(false);
      setStatusType('success');
      setStatusMessage('Land saved successfully. History updated.');
      await loadLands();
      if (createdLand?.id) {
        setExpandedHistoryLandId(createdLand.id);
        await loadHistory(createdLand.id);
      }
    } catch (error) {
      console.error('Failed to create land:', error);
      setStatusType('error');
      setStatusMessage('Failed to save land. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async (landId) => {
    setHistoryByLandId((current) => ({
      ...current,
      [landId]: {
        ...(current[landId] || {}),
        loading: true,
        error: '',
      },
    }));

    try {
      const { data } = await farmingAPI.getLandHistory(landId);
      setHistoryByLandId((current) => ({
        ...current,
        [landId]: {
          loading: false,
          data,
          error: '',
        },
      }));
    } catch (error) {
      console.error('Failed to load land history:', error);
      setHistoryByLandId((current) => ({
        ...current,
        [landId]: {
          ...(current[landId] || {}),
          loading: false,
          error: 'Unable to load history right now.',
        },
      }));
    }
  };

  const formatTimelineDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const toggleHistory = async (landId) => {
    if (expandedHistoryLandId === landId) {
      setExpandedHistoryLandId(null);
      return;
    }

    setExpandedHistoryLandId(landId);
    if (!historyByLandId[landId]?.data && !historyByLandId[landId]?.loading) {
      await loadHistory(landId);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {statusMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 14,
            background: statusType === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: statusType === 'success' ? 'var(--primary-600)' : 'var(--accent-600)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {statusMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🌾 My Lands</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage your farming land parcels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Land'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in-up" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register New Land</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Land Name</label>
              <input className="input-field" placeholder="e.g., Rajshahi Mango Garden" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Location</label>
              <input className="input-field" placeholder="District, Upazila" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Area (acres)</label>
              <input className="input-field" type="number" step="0.01" placeholder="2.5" value={form.area_acres} onChange={(e) => setForm({ ...form, area_acres: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Notes</label>
              <input className="input-field" placeholder="Any additional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="loading-spinner" /> : '💾 Save Land'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="loading-spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : lands.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, margin: '12px 0 8px' }}>No lands registered yet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Add your first land parcel to get personalized AI farming advice
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {lands.map((land) => (
            <div key={land.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{land.name}</div>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px',
                  background: land.soil_type ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: land.soil_type ? 'var(--primary-600)' : 'var(--accent-600)',
                  borderRadius: 'var(--radius-full)', fontWeight: 600,
                }}>
                  {land.soil_type || 'Unclassified'}
                </span>
              </div>
              {land.location && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                  📍 {land.location}
                </div>
              )}
              {land.area_acres && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  📐 {land.area_acres} acres
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Link to={`/land/${land.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  👁️ View Details
                </Link>
                <a href={`/soil-classify`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  🌱 Classify Soil
                </a>
                <a href={`/chat`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  🤖 Ask AI
                </a>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleHistory(land.id)}
                >
                  🕰️ History
                </button>
              </div>

              {expandedHistoryLandId === land.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {historyByLandId[land.id]?.loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                      <div className="loading-spinner" />
                    </div>
                  ) : historyByLandId[land.id]?.error ? (
                    <div style={{ color: 'var(--accent-600)', fontSize: '0.85rem' }}>
                      {historyByLandId[land.id].error}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>Farming History</div>
                      {(historyByLandId[land.id]?.data?.crop_history || []).length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No crop history yet for this land.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {historyByLandId[land.id].data.crop_history.map((track) => (
                            <div key={track.id} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem', fontWeight: 700 }}>
                                <span>{track.crop_name}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{track.status}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {track.season}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '14px 0 10px' }}>Farming Cycle History</div>
                      {(historyByLandId[land.id]?.data?.cycle_history || []).length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No farming cycle history yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {historyByLandId[land.id].data.cycle_history.map((entry) => (
                            <div key={entry.id} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem', fontWeight: 700 }}>
                                <span>{entry.track?.crop_name || 'Crop cycle'}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{entry.action_type}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {entry.summary} • {entry.track?.season || 'Season not set'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '14px 0 10px' }}>Activity Memory</div>
                      {(historyByLandId[land.id]?.data?.activity_history || []).length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No irrigation, fertilizer, pesticide, or harvest logs yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {historyByLandId[land.id].data.activity_history.map((entry) => (
                            <div key={entry.id} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem', fontWeight: 700 }}>
                                <span style={{ textTransform: 'capitalize' }}>{entry.activity_type}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{formatTimelineDate(entry.occurred_at)}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {entry.track?.crop_name || 'Crop cycle'}{entry.quantity ? ` • ${entry.quantity} ${entry.unit || ''}` : ''}
                              </div>
                              {entry.notes ? <div style={{ fontSize: '0.78rem', marginTop: 4 }}>{entry.notes}</div> : null}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '14px 0 10px' }}>Other History</div>
                      {(historyByLandId[land.id]?.data?.land_history || []).length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No land updates recorded yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {historyByLandId[land.id].data.land_history.map((entry) => (
                            <div key={entry.id} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem', fontWeight: 700 }}>
                                <span>{entry.summary}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{entry.action_type}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                {new Date(entry.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
