import { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * PublicRoute: If user is authenticated, redirect to dashboard.
 * Otherwise render children (used for /login and /signup).
 */
export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
