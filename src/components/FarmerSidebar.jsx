import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { section: t('main'), items: [
      { to: '/dashboard', icon: '📊', label: t('dashboard') },
      { to: '/chat', icon: '🤖', label: t('ai_assistant') },
    ]},
    { section: t('farming'), items: [
      { to: '/lands', icon: '🌾', label: t('my_lands') },
      { to: '/weather', icon: '🌦️', label: t('weather_forecast') },
      { to: '/disease-detect', icon: '🔬', label: t('disease_detection') },
      { to: '/soil-classify', icon: '🌱', label: t('soil_analysis') },
    ]},
    { section: t('services'), items: [
      { to: '/marketplace', icon: '🛒', label: t('marketplace') },
      { to: '/orders', icon: '📦', label: t('orders') },
      { to: '/market-trends', icon: '📊', label: t('market_trends') },
      { to: '/profit-loss', icon: '📈', label: t('profit_calculator') },
      { to: '/tracks', icon: '🌾', label: t('my_crop_tracks') },
      { to: '/consultation', icon: '🩺', label: t('expert_consultation') },
    ]},
    { section: t('account'), items: [
      { to: '/profile', icon: '👤', label: t('profile') },
      { to: '/billing', icon: '💳', label: t('plans_billing') },
    ]},
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || user.username?.[0] || '')
    : '?';

  return (
    <aside className="app-sidebar" id="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🌿</div>
        <div>
          <div className="sidebar-brand-text">SofolKrishok</div>
          <div className="sidebar-brand-sub">Smart Farming</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '12px 16px' }}>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" />
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: user?.avatar ? 0 : undefined }}>
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initials.toUpperCase()
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.first_name || user?.username}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
