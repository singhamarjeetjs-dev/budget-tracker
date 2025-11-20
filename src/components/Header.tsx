// File: src/components/Header.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Header() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const displayName = user?.displayName || user?.email || 'User';

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signout();
      navigate('/login', { replace: true });
    } catch (err) {
      // optionally show a toast; keep silent for now
      console.error('Logout failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="w-full app-header">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
            BT
          </div>
          <Link to="/" className="text-lg font-semibold">
            Budget Tracker
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link to="/" className="hover:text-gray-900 dark:hover:text-white">
              Dashboard
            </Link>
            <Link to="/transactions" className="hover:text-gray-900 dark:hover:text-white">
              Transactions
            </Link>
          </nav>

          {/* User area */}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              {/* avatar / initials */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                {String(displayName).charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block text-sm">
                <div className="font-medium">{displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="ml-2 px-3 py-1 rounded-md border btn-ghost"
                title="Logout"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1 rounded-md btn-ghost">
                Sign in
              </Link>
              <Link to="/signup" className="px-3 py-1 rounded-md btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
