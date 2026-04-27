import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StaffSidebar from './StaffSidebar';
import NotificationCenter from './NotificationCenter';

export default function StaffLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'farmer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-layout staff-portal-layout">
      <StaffSidebar />
      <main className="app-main staff-main">
        <div className="staff-topbar">
          <h2 className="staff-topbar-title">
            Staff Resource Portal
          </h2>
          <div className="staff-topbar-right">
            <NotificationCenter />
            <div className="staff-role-chip">
              Operating as: <strong>{(user.role || 'staff').replace('_', ' ')}</strong>
            </div>
          </div>
        </div>
        
        <div className="staff-content-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
