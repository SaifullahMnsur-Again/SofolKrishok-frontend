import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmingAPI } from '../services/api';

export default function LandDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [activeTab, setActiveTab] = useState('details');
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cycles, setCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    area_acres: '',
    notes: '',
  });

  useEffect(() => {
    loadLand();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'history' && !history) {
      loadHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'cycles' && cycles.length === 0) {
      loadCycles();
    }
  }, [activeTab]);

  const loadCycles = async () => {
    setCyclesLoading(true);
    try {
      const { data } = await farmingAPI.getCycles();
      const allCycles = data.results || data || [];
      const landCycles = allCycles.filter((cycle) => Number(cycle.land) === Number(id));
      setCycles(landCycles);
    } catch (error) {
      console.error('Failed to load farming cycles:', error);
    } finally {
      setCyclesLoading(false);
    }
  };

  const loadLand = async () => {
    try {
      const { data } = await farmingAPI.getLand(id);
      setLand(data);
      setForm({
        name: data.name || '',
        location: data.location || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        area_acres: data.area_acres || '',
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Failed to load land:', error);
      setStatusType('error');
      setStatusMessage('Failed to load land details');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await farmingAPI.getLandHistory(id);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        name: form.name,
        location: form.location,
        area_acres: form.area_acres ? parseFloat(form.area_acres) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        notes: form.notes,
      };
      const { data } = await farmingAPI.updateLand(id, updateData);
      setLand(data);
      setEditing(false);
      setStatusType('success');
      setStatusMessage('Land details updated successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update land:', error);
      setStatusType('error');
      setStatusMessage('Failed to update land details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await farmingAPI.deleteLand(id);
      setStatusType('success');
      setStatusMessage('Land deleted successfully');
      setTimeout(() => navigate('/lands'), 1500);
    } catch (error) {
      console.error('Failed to delete land:', error);
      setStatusType('error');
      setStatusMessage('Failed to delete land');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-600)' }}>
          Land not found
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/lands')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
              }}
            >
              ← Back
            </button>
            <h1 className="page-title" style={{ margin: 0 }}>{land.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {land.soil_type && (
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(34,197,94,0.12)',
                  color: 'var(--primary-600)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                🌱 {land.soil_type}
              </span>
            )}
            {land.location && (
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(59,130,246,0.12)',
                  color: 'var(--blue-600)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                📍 {land.location}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setEditing(!editing)}
            disabled={saving}
          >
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
          {!editing && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ color: 'var(--accent-600)' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="glass-card"
            style={{ padding: 24, maxWidth: 400, margin: '0 20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Delete Land?</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              This will permanently delete <strong>{land.name}</strong> and all associated crop tracks and activity logs. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: 'var(--accent-600)' }}
              >
                {deleting ? <span className="loading-spinner" /> : 'Delete Land'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {['details', 'cycles', 'history'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary-600)' : 'none',
              color: activeTab === tab ? 'var(--primary-600)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'details' ? '📋 Details' : tab === 'cycles' ? '🌾 Cycles' : '🕰️ History'}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="animate-fade-in-up">
          {!editing ? (
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Basic Info */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Land Name
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 20 }}>{land.name}</div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Location
                  </div>
                  <div style={{ fontSize: '1rem', marginBottom: 20 }}>{land.location || '—'}</div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Area (Acres)
                  </div>
                  <div style={{ fontSize: '1rem', marginBottom: 20 }}>{land.area_acres || '—'}</div>
                </div>

                {/* Geo & Soil */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Latitude
                  </div>
                  <div style={{ fontSize: '1rem', marginBottom: 20, fontFamily: 'monospace' }}>{land.latitude || '—'}</div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Longitude
                  </div>
                  <div style={{ fontSize: '1rem', marginBottom: 20, fontFamily: 'monospace' }}>{land.longitude || '—'}</div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Soil Type
                  </div>
                  <div style={{ fontSize: '1rem', marginBottom: 20 }}>{land.soil_type || 'Unclassified'}</div>
                </div>
              </div>

              {land.notes && (
                <>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Notes
                  </div>
                  <div style={{ fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{land.notes}</div>
                </>
              )}

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <div>Created: {formatDateTime(land.created_at)}</div>
                <div style={{ marginTop: 4 }}>Last Updated: {formatDateTime(land.updated_at)}</div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 24 }}>
              <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 16 }}>
                {/* Row 1: Name & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label className="input-label">Land Name *</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="e.g., Rajshahi Mango Garden"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Location</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="District, Upazila"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Area, Latitude, Longitude */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label className="input-label">Area (Acres)</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.01"
                      placeholder="2.5"
                      value={form.area_acres}
                      onChange={(e) => setForm({ ...form, area_acres: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Latitude</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.0000001"
                      placeholder="23.8103"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Longitude</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.0000001"
                      placeholder="90.3563"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="input-group">
                  <label className="input-label">Notes</label>
                  <textarea
                    className="input-field"
                    placeholder="Any additional notes about this land..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={5}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? <span className="loading-spinner" /> : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
            {/* Cycles Tab */}
            {activeTab === 'cycles' && (
              <div className="animate-fade-in-up">
                {cyclesLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : cycles.length === 0 ? (
                  <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌾</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>No farming cycles yet</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Start a farming cycle to track seasonal activities</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 24 }}>
                    {cycles.map((cycle) => (
                      <div key={cycle.id} className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                              Started: {formatDate(cycle.started_at)} {cycle.actual_end_at ? `• Ended: ${formatDate(cycle.actual_end_at)}` : cycle.expected_end_at ? `• Expected: ${formatDate(cycle.expected_end_at)}` : ''}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '4px 12px',
                              background: 
                                cycle.status === 'active' ? 'rgba(34,197,94,0.12)' :
                                cycle.status === 'completed' ? 'rgba(100,116,139,0.12)' :
                                'rgba(245,158,11,0.12)',
                              color:
                                cycle.status === 'active' ? 'var(--primary-600)' :
                                cycle.status === 'completed' ? 'var(--text-secondary)' :
                                'var(--accent-600)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          >
                            {cycle.status}
                          </span>
                        </div>

                        {cycle.description && (
                          <div style={{ fontSize: '0.9rem', marginBottom: 12, lineHeight: 1.5 }}>
                            {cycle.description}
                          </div>
                        )}

                        {/* Cycle Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                          {cycle.soil_preparation_notes && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Soil Notes</div>
                              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{cycle.soil_preparation_notes}</div>
                            </div>
                          )}
                          {cycle.expected_yield && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expected Yield</div>
                              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{cycle.expected_yield} kg</div>
                            </div>
                          )}
                          {cycle.actual_yield && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase' }}>Actual Yield</div>
                              <div style={{ fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>{cycle.actual_yield} kg</div>
                            </div>
                          )}
                          {cycle.total_investment && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Investment</div>
                              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>৳{cycle.total_investment}</div>
                            </div>
                          )}
                          {cycle.total_revenue && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase' }}>Revenue</div>
                              <div style={{ fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>৳{cycle.total_revenue}</div>
                            </div>
                          )}
                        </div>

                        {/* History Table */}
                        {(cycle.history_entries || []).length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, marginTop: 16 }}>📋 Modification History</div>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                              }}>
                                <thead>
                                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Date & Time</th>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Action</th>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Summary</th>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Modified By</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cycle.history_entries || []).map((entry, idx) => (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                      <td style={{ padding: '10px' }}>{formatDateTime(entry.created_at)}</td>
                                      <td style={{ padding: '10px' }}>
                                        <span style={{
                                          display: 'inline-block',
                                          padding: '2px 8px',
                                          background: entry.action_type === 'created' ? 'rgba(34,197,94,0.12)' :
                                                      entry.action_type === 'status_changed' ? 'rgba(59,130,246,0.12)' :
                                                      entry.action_type === 'completed' ? 'rgba(168,85,247,0.12)' :
                                                      'rgba(156,163,175,0.12)',
                                          color: entry.action_type === 'created' ? 'var(--primary-600)' :
                                                 entry.action_type === 'status_changed' ? 'var(--blue-600)' :
                                                 entry.action_type === 'completed' ? '#a855f7' :
                                                 'var(--text-secondary)',
                                          borderRadius: 'var(--radius-full)',
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          textTransform: 'capitalize',
                                        }}>
                                          {entry.action_type.replace('_', ' ')}
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px' }}>{entry.summary}</td>
                                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                                        {entry.modified_by_name || 'System'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
      {activeTab === 'history' && (
        <div className="animate-fade-in-up">
          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : history ? (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Crop Tracks */}
              {(history.crop_history || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🌾 Crop Tracks</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {history.crop_history.map((track) => (
                      <div key={track.id} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid var(--primary-600)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{track.crop_name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                              {track.season} • Status: <strong>{track.status}</strong>
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '4px 12px',
                              background: track.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                              color: track.status === 'active' ? 'var(--primary-600)' : 'var(--accent-600)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            {track.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                          {track.planted_date && <div>🌱 Planted: {formatDate(track.planted_date)}</div>}
                          {track.expected_harvest_date && <div>🎯 Expected: {formatDate(track.expected_harvest_date)}</div>}
                          {track.actual_harvest_date && <div>✅ Harvested: {formatDate(track.actual_harvest_date)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log */}
              {(history.activity_history || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📋 Activity Memory</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {history.activity_history.map((activity) => (
                      <div key={activity.id} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid var(--blue-600)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{activity.activity_type}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDateTime(activity.occurred_at)}</div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {activity.track?.crop_name || 'Crop cycle'}
                          {activity.quantity && ` • ${activity.quantity} ${activity.unit || ''}`}
                        </div>
                        {activity.notes && <div style={{ fontSize: '0.85rem', marginTop: 6, lineHeight: 1.4 }}>{activity.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Land Changes */}
              {(history.land_history || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🔄 Land Updates</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {history.land_history.map((entry) => (
                      <div key={entry.id} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid var(--primary-600)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ fontWeight: 600 }}>{entry.summary}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDateTime(entry.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!history.crop_history?.length && !history.activity_history?.length && !history.land_history?.length && (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>No history yet</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Start tracking crops and activities to build your land history</div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--accent-600)' }}>
              Failed to load history
            </div>
          )}
        </div>
      )}
    </div>
  );
}
