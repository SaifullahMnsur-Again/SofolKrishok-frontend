import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password_confirm: '', role: 'farmer',
    phone: '', preferred_language: 'bn',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join(' | '));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="glass-card auth-card animate-fade-in-up" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
        </div>
        <h1 className="auth-title">Join SofolKrishok</h1>
        <p className="auth-subtitle">Create your account to start smart farming</p>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-first">First Name</label>
              <input id="reg-first" className="input-field" placeholder="First name" value={form.first_name} onChange={update('first_name')} required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-last">Last Name</label>
              <input id="reg-last" className="input-field" placeholder="Last name" value={form.last_name} onChange={update('last_name')} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-username">Username</label>
            <input id="reg-username" className="input-field" placeholder="Choose a username" value={form.username} onChange={update('username')} required />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={update('email')} required />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-phone">Phone</label>
            <input id="reg-phone" className="input-field" placeholder="+880..." value={form.phone} onChange={update('phone')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-role">Role</label>
              <select id="reg-role" className="input-field" value={form.role} onChange={update('role')}>
                <option value="farmer">Farmer</option>
                <option value="sales">Sales Team</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-lang">Language</label>
              <select id="reg-lang" className="input-field" value={form.preferred_language} onChange={update('preferred_language')}>
                <option value="bn">Bengali</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-pass">Password</label>
              <input id="reg-pass" className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-pass2">Confirm</label>
              <input id="reg-pass2" className="input-field" type="password" placeholder="Repeat password" value={form.password_confirm} onChange={update('password_confirm')} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? <span className="loading-spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
