import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function StaffSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || user.username?.[0] || '')
    : '?';

  // Dynamic Navigation based on role
  const navItems = [
    {
      section: 'Platform',
      items: [
        { to: '/staff', icon: '📊', label: 'Overview', roles: ['sales', 'service', 'expert', 'sales_team_member', 'service_team_member', 'sales_team_lead', 'service_team_lead', 'branch_manager', 'general_manager', 'site_engineer'] },
        { to: '/staff/service', icon: '🤖', label: 'AI Services Hub', roles: ['service', 'service_team_member', 'service_team_lead', 'expert', 'branch_manager', 'general_manager'] },
        { to: '/staff/model-hub', icon: '🧠', label: 'AI Model Hub', roles: ['general_manager', 'service_team_lead'] },
      ],
    },
    {
      section: 'Operations',
      items: [
        { to: '/staff/marketplace', icon: '📦', label: 'Manage Products', roles: ['sales', 'sales_team_member', 'sales_team_lead', 'branch_manager', 'general_manager'] },
        { to: '/staff/sales-kanban', icon: '📋', label: 'Fulfillment Board', roles: ['sales', 'sales_team_member', 'sales_team_lead', 'branch_manager', 'general_manager'] },
        { to: '/staff/consultation', icon: '🗓️', label: 'Expert Schedule Manager', roles: ['service', 'service_team_member', 'service_team_lead', 'expert', 'branch_manager', 'general_manager'] },
      ],
    },
    {
      section: 'Administration',
      items: [
        { to: '/staff/profile', icon: '👤', label: 'Profile', roles: ['general_manager', 'site_engineer', 'branch_manager', 'sales_team_lead', 'service_team_lead', 'sales_team_member', 'service_team_member', 'sales', 'service', 'expert'] },
        { to: '/staff/finance', icon: '💰', label: 'Subscriptions', roles: ['service_team_lead', 'sales_team_lead', 'branch_manager', 'general_manager'] },
        { to: '/staff/users', icon: '👥', label: 'User Registry', roles: ['general_manager', 'site_engineer'] },
        { to: '/staff/audit-logs', icon: '📜', label: 'Audit Logs', roles: ['general_manager', 'site_engineer'] },
      ],
    },
  ];

  // Filter items that match the user's role
  const filteredNavItems = navItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user?.role))
  })).filter(section => section.items.length > 0);

  // Close sidebar on nav link click (mobile)
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside 
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        id="staff-sidebar"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 0',
        }}>
          <div className="sidebar-brand" style={{ borderBottom: 'none', marginBottom: 0, flex: 1 }}>
            <div className="sidebar-brand-icon">🏢</div>
            <div>
              <div className="sidebar-brand-text">Staff Portal</div>
              <div className="sidebar-brand-sub">SofolKrishok</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="mobile-hamburger"
              style={{ display: isOpen ? 'flex' : undefined }}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>
        <div style={{ borderBottom: '1px solid var(--glass-border)', margin: '0 20px 16px' }} />

        <nav className="sidebar-nav">
          {filteredNavItems.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/staff'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
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
    </>
  );
}
