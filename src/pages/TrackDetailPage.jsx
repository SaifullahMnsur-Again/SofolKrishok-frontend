import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { farmingAPI } from '../services/api';

export default function TrackDetailPage() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Loading track lifecycle...</p>;
  if (!track) return <p>Track not found.</p>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">{track.crop_name} Lifecycle</h1>
      <p className="page-subtitle">{track.season} • {track.land_name}</p>

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
