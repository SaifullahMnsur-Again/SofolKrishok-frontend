import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Guards routes that require authentication
 * If user is not authenticated, redirects to login page
 * If loading, shows nothing (prevents flash of login page)
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Prevent flash while checking auth

  return user ? children : <Navigate to="/login" replace />;
}
