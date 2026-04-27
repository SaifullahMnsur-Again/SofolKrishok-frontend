import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getNotifications();
      setNotifications(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await authAPI.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        style={{ position: 'relative', background: 'transparent', border: 'none', fontSize: '1.2rem' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            background: '#ef4444', 
            color: 'white', 
            borderRadius: '50%', 
            padding: '2px 6px', 
            fontSize: '0.65rem',
            fontWeight: 800
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass" style={{ 
          position: 'absolute', 
          top: '100%', 
          right: 0, 
          width: 'min(360px, calc(100vw - 24px))', 
          maxHeight: 'min(450px, 70vh)', 
          overflowY: 'auto', 
          marginTop: '10px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          padding: '1rem',
          zIndex: 2000,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Alert Center</h4>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>

          {loading ? <p style={{ fontSize: '0.85rem' }}>Syncing...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.12)',
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ textAlign: 'center', py: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new alerts.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
