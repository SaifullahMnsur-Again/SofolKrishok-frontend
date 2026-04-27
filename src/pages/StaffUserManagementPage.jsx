import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function StaffUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'sales_team_lead', label: 'Sales Team Lead' },
    { value: 'service_team_lead', label: 'Service Team Lead' },
    { value: 'sales_team_member', label: 'Sales Team Member' },
    { value: 'service_team_member', label: 'Service Team Member' },
    { value: 'sales', label: 'Sales Team (Legacy)' },
    { value: 'service', label: 'Service Team (Legacy)' },
    { value: 'expert', label: 'Expert' },
    { value: 'branch_manager', label: 'Branch Manager' },
    { value: 'general_manager', label: 'General Manager' },
    { value: 'site_engineer', label: 'Site Engineer' },
  ];

  const staffRoles = new Set([
    'general_manager', 'site_engineer', 'branch_manager',
    'sales_team_lead', 'service_team_lead',
    'sales_team_member', 'service_team_member',
    'sales', 'service', 'expert',
  ]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getUsers();
      setUsers(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setActivity(null);
    setSelectedUserId(null);
  }, [activeTab]);

  const loadUserActivity = async (userId) => {
    try {
      setActivityLoading(true);
      const { data } = await authAPI.getUserActivity(userId);
      setActivity(data);
      setSelectedUserId(userId);
    } catch (err) {
      console.error(err);
      alert('Failed to load user activity details.');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authAPI.updateUser(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Unauthorized: Only General Managers can modify roles.");
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const next = !user.is_active;
      await authAPI.updateUser(user.id, { is_active: next });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u)));
    } catch (err) {
      alert('Failed to update account status.');
    }
  };

  const handleExpertTagsSave = async (userId, rawTags) => {
    try {
      await authAPI.updateUser(userId, { expert_tags: rawTags });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, expert_tags: rawTags } : u)));
    } catch (err) {
      alert('Failed to update expert tags.');
    }
  };

  const farmers = users.filter((u) => u.role === 'farmer');
  const staff = users.filter((u) => staffRoles.has(u.role));

  const gm = staff.find((u) => u.role === 'general_manager');
  const salesLead = staff.find((u) => u.role === 'sales_team_lead');
  const serviceLead = staff.find((u) => u.role === 'service_team_lead');
  const salesMembers = staff.filter((u) => ['sales_team_member', 'sales'].includes(u.role));
  const serviceMembers = staff.filter((u) => ['service_team_member', 'service'].includes(u.role));
  const experts = staff.filter((u) => u.role === 'expert');
  const expertTagSuggestions = Array.from(
    new Set(
      experts
        .flatMap((u) => String(u.expert_tags || '').split(','))
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const baseUsers = activeTab === 'farmers' ? farmers : staff;
  const visibleUsers = baseUsers.filter((u) => {
    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q
      ? true
      : [u.username, u.email, u.phone, u.first_name, u.last_name, u.expert_tags]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
    return matchRole && matchSearch;
  });

  const selectedUser = visibleUsers.find((u) => u.id === selectedUserId);

  return (
    <div className="animate-fade-in-up">
      <h3 style={{ marginTop: 0, color: '#334155' }}>Platform Access Control (RBAC)</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Manage farmers and staff with hierarchy-based oversight and activity drilldown.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className={`btn ${activeTab === 'farmers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('farmers')}
        >
          Farmers ({farmers.length})
        </button>
        <button
          className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff ({staff.length})
        </button>
      </div>

      <div className="glass-card" style={{ padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
        <input
          className="input"
          placeholder="Search by name, email, phone, tags"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {activeTab === 'staff' && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Org Hierarchy</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Top Management</div>
              <div style={{ fontWeight: 600 }}>{gm ? gm.username : 'No GM assigned'}</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sales Team Lead</div>
              <div style={{ fontWeight: 600 }}>{salesLead ? salesLead.username : 'Not assigned'}</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Service Team Lead</div>
              <div style={{ fontWeight: 600 }}>{serviceLead ? serviceLead.username : 'Not assigned'}</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Teams</div>
              <div style={{ fontWeight: 600 }}>Sales Members: {salesMembers.length} | Service Members: {serviceMembers.length} | Experts: {experts.length}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? <p style={{ padding: '2rem' }}>Syncing user registry...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Username</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Phone</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Current Role</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Expert Tags</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Joined</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{u.username}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ 
                      background: u.role.includes('manager') ? '#fef3c7' : u.role === 'expert' ? '#ede9fe' : '#dcfce7',
                      color: u.role.includes('manager') ? '#92400e' : u.role === 'expert' ? '#5b21b6' : '#166534',
                      textTransform: 'capitalize'
                    }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', minWidth: 220 }}>
                    {u.role === 'expert' ? (
                      <input
                        className="input"
                        style={{ minHeight: 34, padding: '4px 8px', fontSize: '0.8rem' }}
                        value={u.expert_tags || ''}
                        list="expert-tag-suggestions"
                        onChange={(e) => setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, expert_tags: e.target.value } : x))}
                        onBlur={(e) => handleExpertTagsSave(u.id, e.target.value)}
                        placeholder="soil, rice, pest"
                      />
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select 
                        className="input" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem', minHeight: 34 }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <button className="btn btn-secondary btn-sm" onClick={() => loadUserActivity(u.id)}>
                        View Activity
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleStatusToggle(u)}>
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '1.2rem', color: '#64748b', textAlign: 'center' }}>
                    No {activeTab} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <datalist id="expert-tag-suggestions">
        {expertTagSuggestions.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>

      <div className="glass-card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          {selectedUser ? `Activity: ${selectedUser.username}` : 'Select a user to inspect activities'}
        </div>
        {activityLoading ? (
          <div>Loading activity...</div>
        ) : activity ? (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {Object.entries(activity.summary || {}).map(([k, v]) => (
                <span key={k} className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                  {k.replace('_', ' ')}: {v}
                </span>
              ))}
            </div>
            {activity.user_type === 'farmer' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h5 style={{ margin: '0 0 8px 0' }}>Recent Consultations</h5>
                  {(activity.recent_consultations || []).map((item) => (
                    <div key={item.id} style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                      #{item.id} | {item.date} | {item.status} | expert: {item.expert}
                    </div>
                  ))}
                </div>
                <div>
                  <h5 style={{ margin: '0 0 8px 0' }}>Recent Orders</h5>
                  {(activity.recent_orders || []).map((item) => (
                    <div key={item.id} style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                      #{item.id} | {item.status} | ৳{item.amount}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h5 style={{ margin: '0 0 8px 0' }}>Recent Staff Activities</h5>
                {(activity.recent_activities || []).map((item) => (
                  <div key={item.id} style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                    {item.action_type} | {item.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Farmers view shows lands/crop/orders/consultation summary. Staff view shows activity logs and operational metrics.
          </div>
        )}
      </div>
    </div>
  );
}
