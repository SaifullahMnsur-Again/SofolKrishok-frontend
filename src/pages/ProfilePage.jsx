import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const tabLabels = {
  overview: 'Overview',
  edit: 'Edit Profile',
  preferences: 'Preferences',
  security: 'Security',
};

export default function ProfilePage({ portal = 'farmer' }) {
  const { updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    preferred_language: 'bn',
    expert_tags: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await authAPI.getProfile();
        setProfile(data);
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          preferred_language: data.preferred_language || 'bn',
          expert_tags: data.expert_tags || '',
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await updateProfile(form);
      const { data } = await authAPI.getProfile();
      setProfile(data);
      setMessage('Profile updated successfully.');
      setActiveTab('overview');
    } catch (error) {
      setMessage('Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const summaryTiles = [
    { label: 'Role', value: profile?.role?.replace('_', ' ') || 'Unknown' },
    { label: 'Portal', value: portal },
    { label: 'Theme', value: theme },
    { label: 'Language', value: lang },
  ];

  const completionChecks = [
    Boolean(form.first_name),
    Boolean(form.last_name),
    Boolean(form.email),
    Boolean(form.phone),
    Boolean(form.address),
  ];
  const completionPercent = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  if (loading) {
    return <div className="profile-shell"><div className="staff-panel-card">Loading profile...</div></div>;
  }

  return (
    <div className="profile-shell animate-fade-in-up">
      <div className="profile-hero glass-card">
        <div>
          <h2 style={{ margin: 0 }}>Profile Center</h2>
          <p style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
            Modern account view for identity, preferences, and security.
          </p>
        </div>
        <div className="profile-avatar">
          {(profile?.first_name?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
        </div>
      </div>

      <div className="profile-tab-row">
        {Object.keys(tabLabels).map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {message && (
        <div className="glass-card" style={{ padding: 10, fontSize: '0.9rem' }}>{message}</div>
      )}

      {activeTab === 'overview' && (
        <div className="profile-section glass-card">
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong>Profile Completion</strong>
              <span>{completionPercent}%</span>
            </div>
            <div style={{ width: '100%', height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.25)' }}>
              <div style={{ width: `${completionPercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#0ea5e9,#16a34a)' }} />
            </div>
          </div>

          <div className="profile-metrics-grid">
            {summaryTiles.map((tile) => (
              <div key={tile.label} className="profile-metric-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{tile.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tile.value}</div>
              </div>
            ))}
          </div>

          <div className="profile-info-grid">
            <div><strong>Name:</strong> {profile?.first_name || '-'} {profile?.last_name || ''}</div>
            <div><strong>Username:</strong> {profile?.username}</div>
            <div><strong>Email:</strong> {profile?.email || '-'}</div>
            <div><strong>Phone:</strong> {profile?.phone || '-'}</div>
            <div><strong>Address:</strong> {profile?.address || '-'}</div>
            <div><strong>Zone:</strong> {profile?.zone || '-'}</div>
            <div><strong>Expert Tags:</strong> {profile?.expert_tags || '-'}</div>
            <div><strong>Joined:</strong> {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : '-'}</div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <form className="profile-section glass-card" onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
          <h4 style={{ margin: 0 }}>Edit Profile</h4>
          <div className="profile-form-grid">
            <input className="input" placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className="input" placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <textarea className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select className="input" value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}>
            <option value="bn">Bengali</option>
            <option value="en">English</option>
          </select>
          {profile?.role === 'expert' && (
            <>
              <input
                className="input"
                placeholder="Expert tags (comma-separated)"
                list="profile-expert-tag-suggestions"
                value={form.expert_tags}
                onChange={(e) => setForm({ ...form, expert_tags: e.target.value })}
              />
              <datalist id="profile-expert-tag-suggestions">
                <option value="soil-health" />
                <option value="rice" />
                <option value="wheat" />
                <option value="corn" />
                <option value="pest-control" />
                <option value="disease-diagnosis" />
                <option value="irrigation" />
                <option value="fertilizer-plan" />
              </datalist>
            </>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {activeTab === 'preferences' && (
        <div className="profile-section glass-card" style={{ display: 'grid', gap: 12 }}>
          <h4 style={{ margin: 0 }}>Preferences</h4>
          <div className="profile-action-row">
            <button className="btn btn-secondary" onClick={toggleTheme}>Toggle Theme</button>
            <button className="btn btn-secondary" onClick={toggleLang}>Toggle Language</button>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Theme and language are shared across your session and stored locally.
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="profile-section glass-card" style={{ display: 'grid', gap: 12 }}>
          <h4 style={{ margin: 0 }}>Security & Access</h4>
          <div>Account status: {profile?.is_active ? 'Active' : 'Disabled'}</div>
          <div>Role: {profile?.role?.replace('_', ' ') || '-'}</div>
          <div>Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : '-'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Password change and avatar upload can be added next if you want a full account settings flow.
          </div>
        </div>
      )}
    </div>
  );
}