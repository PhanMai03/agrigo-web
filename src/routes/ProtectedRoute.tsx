import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/api';

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  if (roles && (!user || !roles.includes(user.role))) return <Navigate replace to="/" />;
  return <>{children}</>;
}
