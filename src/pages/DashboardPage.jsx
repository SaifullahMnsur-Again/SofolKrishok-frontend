import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmingAPI, chatAPI } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ lands: 0, tracks: 0, sessions: 0 });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [landsRes, tracksRes, sessionsRes] = await Promise.allSettled([
          farmingAPI.getLands(),
          farmingAPI.getTracks(),
          chatAPI.getSessions(),
        ]);

        const weatherRes = await farmingAPI.getWeather();
        setWeather(weatherRes.data);

        setStats({
          lands: landsRes.status === 'fulfilled' ? landsRes.value.data?.results?.length || landsRes.value.data?.length || 0 : 0,
          tracks: tracksRes.status === 'fulfilled' ? tracksRes.value.data?.results?.length || tracksRes.value.data?.length || 0 : 0,
          sessions: sessionsRes.status === 'fulfilled' ? sessionsRes.value.data?.results?.length || sessionsRes.value.data?.length || 0 : 0,
        });
      } catch {
        // Stats will show 0
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">{greeting()}, {user?.first_name || user?.username} 👋</h1>
      <p className="page-subtitle">Here's your farming overview for today</p>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {/* Weather Card */}
        <div className="glass-card stat-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                {weather?.current?.temp != null ? `${weather.current.temp}°C` : '--'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>
                {weather?.current?.condition || 'Weather unavailable'}
              </div>
            </div>
            <div style={{ fontSize: '2.5rem' }}>{weather?.current?.emoji || '⛅'}</div>
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: 10, opacity: 0.7 }}>
            {weather?.location || 'Rajshahi, Bangladesh'}
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--primary-500)' }}>🌾</div>
          <div className="stat-card-value">{loading ? '...' : stats.lands}</div>
          <div className="stat-card-label">Land Parcels</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-500)' }}>📋</div>
          <div className="stat-card-value">{loading ? '...' : stats.tracks}</div>
          <div className="stat-card-label">Active Crop Tracks</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--info)' }}>💬</div>
          <div className="stat-card-value">{loading ? '...' : stats.sessions}</div>
          <div className="stat-card-label">AI Chat Sessions</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/chat" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
              🤖 Ask AI Assistant
            </a>
            <a href="/disease-detect" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🔬 Scan Crop Disease
            </a>
            <a href="/soil-classify" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🌱 Analyze Soil Type
            </a>
            <a href="/lands" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🌾 Manage Lands
            </a>
            <a href="/weather" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🌦️ Open Weather Center
            </a>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📊 Platform Features</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🤖', title: 'AI Assistant', desc: 'Get personalized farming advice with memory of your context' },
              { icon: '🔬', title: 'Disease Detection', desc: 'Upload crop photos for instant disease identification' },
              { icon: '🌱', title: 'Soil Analysis', desc: 'Classify your soil type from images' },
              { icon: '🛒', title: 'Marketplace', desc: 'Buy seeds, fertilizers, and equipment' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.3rem' }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>🌦️ Weather Alerts Snapshot</h3>
        {(weather?.alerts || []).length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>No severe alerts right now.</div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            {weather.alerts.length} weather alerts detected. Open the Weather Center for full forecast details.
          </div>
        )}
      </div>
    </div>
  );
}
