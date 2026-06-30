import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { navItems } from '../data/dashboardData.js';
import { FusionMark } from './Sidebar.jsx';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Fusion User';
  const displayRole = user?.user_metadata?.role || 'Member';

  const isActive = (item) =>
    location.pathname === item.to ||
    (item.label === 'Overview' && location.pathname === '/') ||
    (item.label === 'Ventures' && location.pathname.startsWith('/ventures/'));

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="mb-4 lg:hidden">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-950 px-3 py-3 shadow-sm">
        <FusionMark compact />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.to}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-zinc-50 px-3 text-sm font-medium text-zinc-700"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </a>
                ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${
                    active ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </NavLink>
                )
              );
            })}
          </nav>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-950">{displayName}</div>
              <div className="text-xs text-zinc-500">{displayRole}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
