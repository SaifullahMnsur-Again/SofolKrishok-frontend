import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { farmingAPI } from '../services/api';

export default function TrackDetailPage() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingActivity, setSavingActivity] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [activityForm, setActivityForm] = useState({ activity_type: 'irrigation', occurred_at: '', quantity: '', unit: '', notes: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trackRes, stagesRes] = await Promise.all([
        farmingAPI.getTrack(id),
        farmingAPI.getStages(id)
      ]);
      setTrack(trackRes.data);
      setStages(stagesRes.data.results || stagesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActivitySubmit = async (event) => {
    event.preventDefault();
    setActivityError('');
    setSavingActivity(true);
    try {
      await farmingAPI.createTrackActivity(id, {
        ...activityForm,
        quantity: activityForm.quantity ? activityForm.quantity : null,
      });
      setActivityForm({ activity_type: 'irrigation', occurred_at: '', quantity: '', unit: '', notes: '' });
      await fetchData();
    } catch (err) {
      setActivityError(err.response?.data?.detail || 'Failed to save activity.');
    } finally {
      setSavingActivity(false);
    }
  };

  const activityLogs = track?.activity_logs || [];

  if (loading) return <p>Loading track lifecycle...</p>;
  if (!track) return <p>Track not found.</p>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">{track.crop_name} Lifecycle</h1>
      <p className="page-subtitle">{track.season} • {track.land_name}</p>

      <div className="glass-card" style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
        <h3 style={{ marginTop: 0 }}>Crop Memory</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', fontSize: '0.9rem' }}>
          <div><strong>Started:</strong> {track.planted_date || 'Not set'}</div>
          <div><strong>Expected harvest:</strong> {track.expected_harvest_date || 'Not set'}</div>
          <div><strong>Actual harvest:</strong> {track.actual_harvest_date || 'Ongoing'}</div>
          <div><strong>Status:</strong> {track.status}</div>
        </div>
        <p style={{ marginBottom: 0, opacity: 0.8, fontSize: '0.9rem' }}>
          This section stores the land memory for this season, including irrigation, fertilizer, pesticide, and harvest logs.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
        <h3 style={{ marginTop: 0 }}>Add Activity</h3>
        <form onSubmit={handleActivitySubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Activity Type</label>
            <select className="input" style={{ width: '100%' }} value={activityForm.activity_type} onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}>
              <option value="irrigation">Irrigation</option>
              <option value="fertilization">Fertilization</option>
              <option value="pesticide">Pesticide</option>
              <option value="harvest">Harvest</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>When</label>
            <input className="input" style={{ width: '100%' }} type="datetime-local" value={activityForm.occurred_at} onChange={(e) => setActivityForm({ ...activityForm, occurred_at: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Quantity</label>
            <input className="input" style={{ width: '100%' }} type="number" step="0.01" value={activityForm.quantity} onChange={(e) => setActivityForm({ ...activityForm, quantity: e.target.value })} placeholder="Optional" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Unit</label>
            <input className="input" style={{ width: '100%' }} value={activityForm.unit} onChange={(e) => setActivityForm({ ...activityForm, unit: e.target.value })} placeholder="liters, kg, bags" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Notes</label>
            <textarea className="input" style={{ width: '100%', minHeight: 90 }} value={activityForm.notes} onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })} placeholder="What happened, what you used, conditions, result" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={savingActivity}>{savingActivity ? 'Saving...' : 'Save Activity'}</button>
          </div>
        </form>
        {activityError ? <div style={{ marginTop: 10, color: 'var(--accent-600)' }}>{activityError}</div> : null}
      </div>

      <div className="glass-card" style={{ padding: '1.2rem', marginTop: '1.2rem' }}>
        <h3 style={{ marginTop: 0 }}>Activity Timeline</h3>
        {activityLogs.length === 0 ? (
          <p>No activities recorded yet for this crop cycle.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {activityLogs.map((entry) => (
              <div key={entry.id} style={{ padding: '0.9rem', borderRadius: 14, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{entry.activity_type}</strong>
                  <span style={{ opacity: 0.7 }}>{new Date(entry.occurred_at).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: 6 }}>
                  {entry.quantity ? `${entry.quantity} ${entry.unit || ''}`.trim() : 'No quantity logged'}
                </div>
                {entry.notes ? <div style={{ fontSize: '0.85rem', marginTop: 6 }}>{entry.notes}</div> : null}
                {entry.recorded_by_name ? <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 6 }}>Recorded by {entry.recorded_by_name}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Growth Stages & Tasks</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {stages.map((stage, index) => (
            <div key={stage.id} className={`glass-card ${stage.is_current ? 'active-stage' : ''}`} style={{ padding: '1.5rem', opacity: stage.is_current || stage.completed_at ? 1 : 0.6, borderLeft: stage.is_current ? '4px solid var(--primary-color)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Step {index + 1}: {stage.title}</h4>
                {stage.completed_at && <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>✅ Completed</span>}
                {stage.is_current && <span className="badge badge-primary">Current Phase</span>}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stage.description}</p>
              
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Required Tasks:</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {(stage.tasks_json || []).map((task, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <input type="checkbox" checked={!!stage.completed_at} readOnly />
                      {task}
                    </li>
                  ))}
                  {(!stage.tasks_json || stage.tasks_json.length === 0) && <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No specific tasks listed.</li>}
                </ul>
              </div>
            </div>
          ))}
          {stages.length === 0 && (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
               <p>No growth stages have been generated for this track yet.</p>
               <button className="btn btn-primary btn-sm">Generate Stages using AI</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
