import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

/* ── helpers ──────────────────────────────────────────────────── */
function resolveAvatar(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  return url.startsWith('/api/') ? url : `${base}${url}`;
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid rgba(148,163,184,0.12)',
    }}>
      {icon && <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0, marginTop: 2 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
          {value || <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontStyle: 'italic' }}>Not set</span>}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{title}</h3>
      {action}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function ProfilePage({ portal = 'farmer' }) {
  const { updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', address: '', preferred_language: 'bn', expert_tags: '',
  });

  /* avatar */
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const avatarInputRef = useRef(null);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  /* save profile */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await loadProfile();
      setEditMode(false);
      flash('Profile saved.');
    } catch {
      flash('Could not save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* avatar handlers */
  const onAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { flash('Only image files allowed.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { flash('Max file size is 5 MB.', 'error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShowAvatarConfirm(true); // show confirmation modal
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setShowAvatarConfirm(false);
    setAvatarSaving(true);
    try {
      const { data } = await authAPI.uploadAvatar(avatarFile);
      setProfile(data);
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      flash('Avatar updated successfully.');
    } catch (err) {
      flash(err.response?.data?.detail || 'Upload failed.', 'error');
    } finally {
      setAvatarSaving(false);
    }
  };

  const cancelAvatarConfirm = () => {
    setShowAvatarConfirm(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleAvatarRemove = async () => {
    setShowRemoveConfirm(false);
    setAvatarSaving(true);
    try {
      const { data } = await authAPI.removeAvatar();
      setProfile(data);
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      flash('Avatar removed.');
    } catch (err) {
      flash(err.response?.data?.detail || 'Could not remove avatar.', 'error');
    } finally {
      setAvatarSaving(false);
    }
  };

  /* derived */
  const initials = ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || profile?.username?.[0] || 'U')).toUpperCase();
  // Use avatar_url (absolute URL returned by backend) — avatar field is a bare relative path
  const currentAvatarUrl = profile?.avatar_url || null;
  const displayAvatar = avatarPreview || currentAvatarUrl;

  const completionFields = [form.first_name, form.last_name, form.email, form.phone, form.address];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 260 }}>
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const msgBg = msg.type === 'error'
    ? { bg: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: 'rgba(239,68,68,0.28)' }
    : { bg: 'rgba(16,185,129,0.1)', color: '#065f46', border: 'rgba(16,185,129,0.28)' };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>

      {/* ── Flash message ── */}
      {msg.text && (
        <div style={{
          padding: '11px 16px', borderRadius: 12, fontSize: '0.88rem',
          background: msgBg.bg, color: msgBg.color, border: `1px solid ${msgBg.border}`,
        }}>
          {msg.text}
        </div>
      )}

      {/* ═══ Upload confirmation modal ═══ */}
      {showAvatarConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: '28px 28px 24px',
            maxWidth: 400, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>📷 Update Profile Photo?</h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              This will replace your current avatar.
              {avatarFile && (
                <span style={{ display: 'block', marginTop: 6, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {avatarFile.name} · {(avatarFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </p>
            {/* Preview */}
            {avatarPreview && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <img
                  src={avatarPreview}
                  alt="preview"
                  style={{
                    width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid rgba(59,130,246,0.35)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                  }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={cancelAvatarConfirm}
                style={{ flex: 1 }}
                disabled={avatarSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAvatarUpload}
                disabled={avatarSaving}
                style={{ flex: 1 }}
              >
                {avatarSaving ? 'Uploading…' : '⬆️ Confirm Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Remove confirmation modal ═══ */}
      {showRemoveConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: '28px 28px 24px',
            maxWidth: 380, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>🗑️ Remove Photo?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your profile photo will be permanently removed. Your initials will be shown instead.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowRemoveConfirm(false)}
                style={{ flex: 1 }}
                disabled={avatarSaving}
              >
                Keep Photo
              </button>
              <button
                className="btn btn-danger"
                onClick={handleAvatarRemove}
                disabled={avatarSaving}
                style={{ flex: 1 }}
              >
                {avatarSaving ? 'Removing…' : '🗑️ Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO BANNER — Avatar + Name + Status
         ════════════════════════════════════════ */}
      <div className="glass-card" style={{
        padding: 0, overflow: 'hidden',
        background: portal === 'staff'
          ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))'
          : 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(14,165,233,0.07))',
      }}>
        {/* gradient strip */}
        <div style={{
          height: 6,
          background: portal === 'staff'
            ? 'linear-gradient(90deg,#6366f1,#3b82f6,#06b6d4)'
            : 'linear-gradient(90deg,#22c55e,#0ea5e9,#f59e0b)',
        }} />

        <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar circle */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 96, height: 96, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', fontWeight: 800, color: '#fff',
                background: portal === 'staff'
                  ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
                  : 'linear-gradient(135deg,#22c55e,#0ea5e9)',
                cursor: 'pointer',
              }}
              onClick={() => avatarInputRef.current?.click()}
              title="Click to change avatar"
            >
              {displayAvatar
                ? <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            {/* Camera badge */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(15,23,42,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.5)',
              }}
            >📷</div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: 'none' }} />
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
              {profile?.first_name
                ? `${profile.first_name} ${profile.last_name || ''}`
                : profile?.username}
            </h1>
            <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                background: portal === 'staff' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                color: portal === 'staff' ? '#4f46e5' : '#15803d',
                border: portal === 'staff' ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(34,197,94,0.25)',
                textTransform: 'capitalize',
              }}>
                {profile?.role?.replace(/_/g, ' ') || 'User'}
              </span>
              <span style={{
                fontSize: '0.78rem', padding: '3px 10px', borderRadius: 99,
                background: profile?.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                color: profile?.is_active ? '#047857' : '#b91c1c',
                border: `1px solid ${profile?.is_active ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.2)'}`,
                fontWeight: 600,
              }}>
                {profile?.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              @{profile?.username}
              {profile?.date_joined && ` · Joined ${new Date(profile.date_joined).toLocaleDateString()}`}
            </div>
          </div>

          {/* Completion bar */}
          <div style={{ minWidth: 160, maxWidth: 200, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              <span>Profile completion</span>
              <span style={{ fontWeight: 700, color: completionPct === 100 ? '#10b981' : 'var(--text-secondary)' }}>{completionPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.25)' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'width 0.6s',
                width: `${completionPct}%`,
                background: completionPct === 100
                  ? 'linear-gradient(90deg,#10b981,#22c55e)'
                  : 'linear-gradient(90deg,#0ea5e9,#22c55e)',
              }} />
            </div>
          </div>
        </div>

        {/* Avatar action row — shown when file is selected */}
        {/* upload confirm: triggered by modal, not inline buttons */}
        {avatarFile && (
          <div style={{ padding: '10px 28px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#0369a1', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)', borderRadius: 99, padding: '3px 10px' }}>
              Preview selected — confirm to save
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAvatarConfirm(true)} disabled={avatarSaving}>
              Review &amp; Upload
            </button>
            <button className="btn btn-secondary btn-sm" onClick={cancelAvatarConfirm} disabled={avatarSaving}>Cancel</button>
          </div>
        )}
        {!avatarFile && currentAvatarUrl && !avatarSaving && (
          <div style={{ padding: '0 28px 14px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowRemoveConfirm(true)} style={{ color: '#ef4444', fontSize: '0.78rem', padding: '4px 10px' }}>
              🗑️ Remove photo
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          TWO-COLUMN BODY
         ════════════════════════════════════════ */}
      <div className="profile-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── LEFT COLUMN ─────────────────────── */}
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>

          {/* Personal Info */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <SectionHeading
              icon="👤"
              title="Personal Information"
              action={
                <button
                  className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setEditMode((v) => !v)}
                  style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                >
                  {editMode ? 'Cancel' : '✏️ Edit'}
                </button>
              }
            />

            {!editMode ? (
              <>
                <InfoRow icon="✉️" label="Email" value={profile?.email} />
                <InfoRow icon="📱" label="Phone" value={profile?.phone} />
                <InfoRow icon="📍" label="Address" value={profile?.address} />
                <InfoRow icon="🌐" label="Language" value={profile?.preferred_language === 'bn' ? '🇧🇩 Bengali' : '🇬🇧 English'} />
                {profile?.role === 'expert' && (
                  <InfoRow icon="🏷️" label="Expert Tags" value={profile?.expert_tags} />
                )}
              </>
            ) : (
              <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input className="input-field" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input className="input-field" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <textarea className="input-field" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                </div>
                <div className="input-group">
                  <label className="input-label">Preferred Language</label>
                  <select className="input-field" value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}>
                    <option value="bn">🇧🇩 Bengali</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                {profile?.role === 'expert' && (
                  <div className="input-group">
                    <label className="input-label">Expert Tags</label>
                    <input
                      className="input-field"
                      list="expert-tags-list"
                      value={form.expert_tags}
                      onChange={(e) => setForm({ ...form, expert_tags: e.target.value })}
                      placeholder="soil-health, rice, wheat…"
                    />
                    <datalist id="expert-tags-list">
                      {['soil-health','rice','wheat','corn','pest-control','disease-diagnosis','irrigation','fertilizer-plan'].map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Details */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <SectionHeading icon="🔒" title="Account Details" />
            <InfoRow icon="🆔" label="Username" value={profile?.username} />
            <InfoRow icon="🎭" label="Role" value={profile?.role?.replace(/_/g, ' ')} />
            <InfoRow icon="📅" label="Joined" value={profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
            <InfoRow icon="🕐" label="Last Updated" value={profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : null} />
            {profile?.zone && <InfoRow icon="🗺️" label="Zone" value={profile.zone} />}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────── */}
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>

          {/* Avatar Photo */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <SectionHeading icon="📷" title="Profile Photo" />
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(148,163,184,0.3)', borderRadius: 14,
                padding: '20px 16px', textAlign: 'center',
                cursor: 'pointer', background: 'rgba(248,250,252,0.5)',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)'}
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar preview" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(59,130,246,0.3)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  {initials}
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {currentAvatarUrl ? 'Click to change photo' : 'Click to upload a photo'}
                <br />
                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>JPG · PNG · WEBP · max 5 MB</span>
              </div>
            </div>
            {avatarFile && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAvatarConfirm(true)} disabled={avatarSaving} style={{ flex: 1 }}>
                  Review &amp; Upload
                </button>
                <button className="btn btn-secondary btn-sm" onClick={cancelAvatarConfirm} disabled={avatarSaving}>
                  Cancel
                </button>
              </div>
            )}
            {currentAvatarUrl && !avatarFile && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRemoveConfirm(true)} disabled={avatarSaving} style={{ width: '100%', marginTop: 8, color: '#ef4444', fontSize: '0.78rem' }}>
                {avatarSaving ? 'Removing…' : '🗑️ Remove photo'}
              </button>
            )}
          </div>

          {/* Preferences */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <SectionHeading icon="⚙️" title="Display Preferences" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.15)',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Current: {theme}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
                  Toggle
                </button>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.15)',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {lang === 'bn' ? '🇧🇩 Bengali' : '🇬🇧 English'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Interface language
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleLang}>
                  Toggle
                </button>
              </div>
            </div>
          </div>

          {/* Security + Password Change */}
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <SectionHeading icon="🛡️" title="Security" />
            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: profile?.is_active ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${profile?.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Account Status</div>
                <div style={{ fontWeight: 700, color: profile?.is_active ? '#047857' : '#b91c1c', fontSize: '0.92rem' }}>
                  {profile?.is_active ? '✅ Active' : '🔴 Disabled'}
                </div>
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.15)',
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Portal</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>
                  {portal === 'staff' ? '🏢 Staff Portal' : '🌾 Farmer Portal'}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <PasswordChangeForm flash={flash} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Password Change Sub-component ───────────────────────────── */
function PasswordChangeForm({ flash }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [localMsg, setLocalMsg] = useState({ text: '', type: '' });

  const localFlash = (text, type = 'success') => {
    setLocalMsg({ text, type });
    setTimeout(() => setLocalMsg({ text: '', type: '' }), 5000);
  };

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0-4
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];
  const s = strength(pwForm.new_password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.changePassword(pwForm);
      localFlash('Password changed. Please log in again.', 'success');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setOpen(false);
      // Tokens are invalidated by password change — force logout after short delay
      setTimeout(() => logout(), 2000);
    } catch (err) {
      localFlash(err.response?.data?.detail || 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ id, label, field, placeholder }) => (
    <div className="input-group">
      <label className="input-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          className="input-field"
          type={show[field] ? 'text' : 'password'}
          value={pwForm[field]}
          onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', paddingRight: 40 }}
          autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [field]: !p[field] }))}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1, padding: 2,
          }}
        >
          {show[field] ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: 14 }}>
      <button
        type="button"
        className={`btn btn-sm ${open ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {open ? 'Cancel' : '🔐 Change Password'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {localMsg.text && (
            <div style={{
              padding: '9px 12px', borderRadius: 10, fontSize: '0.82rem',
              background: localMsg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              color: localMsg.type === 'error' ? '#b91c1c' : '#065f46',
              border: `1px solid ${localMsg.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
            }}>
              {localMsg.text}
            </div>
          )}

          <Field id="current-pw" label="Current Password" field="current_password" placeholder="Your current password" />
          <Field id="new-pw" label="New Password" field="new_password" placeholder="Min. 6 characters" />

          {/* Strength meter */}
          {pwForm.new_password && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 99,
                    background: i <= s ? strengthColor[s] : 'rgba(148,163,184,0.2)',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '0.72rem', color: strengthColor[s], fontWeight: 600 }}>
                {strengthLabel[s]}
              </div>
            </div>
          )}

          <Field id="confirm-pw" label="Confirm New Password" field="confirm_password" placeholder="Repeat new password" />

          {/* Match indicator */}
          {pwForm.confirm_password && (
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: pwForm.new_password === pwForm.confirm_password ? '#10b981' : '#ef4444' }}>
              {pwForm.new_password === pwForm.confirm_password ? '✅ Passwords match' : '❌ Passwords do not match'}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving || !pwForm.current_password || !pwForm.new_password || pwForm.new_password !== pwForm.confirm_password}
            style={{ marginTop: 4 }}
          >
            {saving ? 'Changing…' : '🔐 Update Password'}
          </button>

          <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            You will be logged out after changing your password.
          </p>
        </form>
      )}
    </div>
  );
}