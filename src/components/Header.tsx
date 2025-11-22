// File: src/components/Header.tsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Header() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu open
  const displayName = user?.displayName || user?.email || 'User';
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoading(false);
    }
  };

  // close mobile menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = mobileMenuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, [open]);

  // prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="app-header">
      <div className="container-centered max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* left: logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="brand flex items-center gap-3">
            <div className="logo-box">BT</div>
            <div className="text-lg font-semibold hidden sm:block">Budget Tracker</div>
          </Link>
        </div>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'active' : 'text-muted'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'active' : 'text-muted'}`}>
            Transactions
          </NavLink>
          <button
            onClick={() => navigate('/transactions')}
            className="px-3 py-2 rounded-md btn-ghost"
          >
            Export
          </button>
        </nav>

        {/* right: user area (desktop) + mobile menu button */}
        <div className="flex items-center gap-3">
          {/* user info desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="avatar w-9 h-9 rounded-full bg-[rgba(99,102,241,0.12)] text-[var(--accent)] flex items-center justify-center font-semibold">
                  {String(displayName).charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-sm">
                  <div className="font-medium">{displayName}</div>
                  <div className="text-xs muted">{user?.email}</div>
                </div>
                <button onClick={handleLogout} disabled={loading} className="btn btn-ghost">
                  {loading ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/signup" className="btn btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md border"
            aria-label="Open menu"
            onClick={(e) => {
              // stop propagation so our global click handler doesn't immediately close the menu
              e.stopPropagation();
              setOpen((s) => !s);
            }}
            title="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu panel (full width, stacked) */}
      {open && (
        <div className="md:hidden px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <div ref={mobileMenuRef} className="app-card w-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="logo-box text-sm">BT</div>
                  <div>
                    <div className="font-semibold">{displayName}</div>
                    <div className="muted text-sm">{user?.email}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} aria-label="Close menu" className="p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md">Dashboard</Link>
                <Link to="/transactions" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md">Transactions</Link>
                <button
                  onClick={() => { setOpen(false); navigate('/transactions'); }}
                  className="px-3 py-2 rounded-md btn-ghost text-left"
                >
                  Export CSV
                </button>
              </div>

              <div className="pt-2 border-t" />

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{displayName}</div>
                  <div className="muted text-xs">{user?.email}</div>
                </div>

                {user ? (
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="btn btn-primary">
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setOpen(false)} className="btn btn-ghost">Sign in</Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="btn btn-primary">Sign up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
