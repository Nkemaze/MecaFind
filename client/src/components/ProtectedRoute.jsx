import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <Icon name="progress_activity" size="text-[48px]" className="animate-spin text-primary" />
      </main>
    );
  }

  if (!user) return <Navigate to="/auth/signin" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
