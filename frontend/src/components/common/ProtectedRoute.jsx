import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, requireVerified = false }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireVerified && !user.email_verified_at) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return children;
}