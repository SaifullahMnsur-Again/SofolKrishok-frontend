import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(form.username, form.password);
      const staffRoles = new Set([
        'general_manager',
        'site_engineer',
        'branch_manager',
        'sales',
        'service',
        'expert',
        'sales_team_lead',
        'service_team_lead',
        'sales_team_member',
        'service_team_member',
      ]);
      if (profile?.role && staffRoles.has(profile.role)) {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to SofolKrishok — your smart farming companion</p>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to homepage</Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)',
              color: 'var(--error)', fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="input-field"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? <span className="loading-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>·</span>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Learn more</Link>
        </div>
      </div>
    </div>
  );
}
