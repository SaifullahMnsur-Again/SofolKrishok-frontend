import { useEffect, useMemo, useState } from 'react';
import { farmingAPI } from '../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function FarmingWeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await farmingAPI.getWeather();
        setWeather(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Unable to load weather data.');
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, []);

  const currentSummary = useMemo(() => {
    if (!weather?.current) return null;
    const current = weather.current;
    return {
      label: `${current.emoji || '⛅'} ${current.condition || 'Unknown'}`,
      temp: current.temp != null ? `${current.temp}°C` : '--',
      humidity: current.humidity != null ? `${current.humidity}%` : '--',
      wind: current.wind_speed != null ? `${current.wind_speed} m/s` : '--',
    };
  }, [weather]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">🌦️ Farming Weather Center</h1>
      <p className="page-subtitle">
        OpenWeather forecast for your farm area, with practical risk alerts for crop operations.
      </p>

      {loading ? (
        <div className="glass-card" style={{ padding: 20 }}>Loading weather forecast...</div>
      ) : error ? (
        <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(239, 68, 68, 0.35)' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 16 }}>
            <div className="glass-card stat-card" style={{ minHeight: 120 }}>
              <div className="stat-card-value">{currentSummary?.temp || '--'}</div>
              <div className="stat-card-label">Current Temperature</div>
            </div>
            <div className="glass-card stat-card" style={{ minHeight: 120 }}>
              <div className="stat-card-value">{currentSummary?.humidity || '--'}</div>
              <div className="stat-card-label">Humidity</div>
            </div>
            <div className="glass-card stat-card" style={{ minHeight: 120 }}>
              <div className="stat-card-value">{currentSummary?.wind || '--'}</div>
              <div className="stat-card-label">Wind Speed</div>
            </div>
            <div className="glass-card stat-card" style={{ minHeight: 120 }}>
              <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>{currentSummary?.label || '--'}</div>
              <div className="stat-card-label">Condition</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Location: {weather?.location || 'Rajshahi, Bangladesh'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              {(weather?.forecast || []).map((day) => (
                <div key={day.date} className="glass-card" style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{formatDate(day.date)}</div>
                  <div style={{ fontSize: '1.1rem', marginTop: 3 }}>{day.emoji} {day.condition}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {day.temp_min}°C - {day.temp_max}°C
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Rain: {day.rain_mm} mm
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Risk Alerts</h3>
            {(weather?.alerts || []).length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No severe weather risk alerts for the selected forecast period.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {weather.alerts.map((alert, idx) => (
                  <div
                    key={`${alert.date}-${idx}`}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(245, 158, 11, 0.13)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                    }}
                  >
                    <strong>{alert.date}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
