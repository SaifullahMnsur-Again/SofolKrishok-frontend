import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicOnlyRoute - Guards public routes (login, register) from authenticated users
 * If user is authenticated, redirects to dashboard or staff portal based on role
 * If not authenticated, allows access to the page
 */
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Prevent flash while checking auth

  if (user) {
    // Redirect to appropriate dashboard based on role
    const staffRoles = new Set([
      'general_manager',
      'site_engineer',
      'branch_manager',
      'sales',
      'service',
      'expert',
      'sales_team_lead',
      'service_team_member',
      'sales_team_member',
    ]);

    return user.role && staffRoles.has(user.role) ? 
      <Navigate to="/staff" replace /> : 
      <Navigate to="/dashboard" replace />;
  }

  return children;
}
