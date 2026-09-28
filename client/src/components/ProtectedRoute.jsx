import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import Layout from './Layout';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-ink-500">Đang tải…</div>;
  }
  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/du-an" replace />;

  return <Layout>{children}</Layout>;
}
