import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// For login/signup: if already authenticated, skip straight to the dashboard.
export default function PublicRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
