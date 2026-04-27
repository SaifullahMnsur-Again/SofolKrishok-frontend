import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function StaffAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getAuditLogs();
      setLogs(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="animate-fade-in-up staff-panel-grid">
      <h3 style={{ marginTop: 0 }}>Platform Transparency & Audit Logs</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        A unified ledger of real-time administrative interventions within the SofolKrishok ecosystem.
      </p>

      {loading ? <p>Retrieving secure audit trail...</p> : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {logs.map(log => (
            <div key={log.id} className="staff-audit-item">
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ 
                  padding: '6px 12px', 
                  background: '#f8fafc', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  color: '#475569',
                  minWidth: '150px',
                  textAlign: 'center'
                }}>
                  {log.action_type}
                </div>
                <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{log.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>by <strong>{log.username || 'System'}</strong></div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
          {logs.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No audit events recorded yet.</p>}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <button className="btn btn-secondary btn-sm">Export Audit Trail (CSV)</button>
      </div>
    </div>
  );
}
