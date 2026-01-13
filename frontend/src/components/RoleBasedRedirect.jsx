import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    // If no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default RoleBasedRedirect;