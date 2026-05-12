import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const roleHome = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/dashboard',
};

export default function ProtectedRoute({ children, allowedRole }) {
  const { token, role } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={roleHome[role] || '/login'} replace />;
  }

  return children;
}