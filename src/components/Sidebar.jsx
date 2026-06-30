import { LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { navItems } from '../data/dashboardData.js';

export function FusionMark({ compact = false }) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden ${compact ? 'h-16 w-44' : 'h-20 w-full'}`}>
      <img
        src="/fusion-ventures-vector-white.svg"
        alt="Fusion Ventures"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Fusion User';
  const displayRole = user?.user_metadata?.role || 'Member';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col bg-zinc-950 p-5 text-white shadow-2xl lg:flex">
      <div className="px-1">
        <FusionMark />
      </div>

      <div className="mt-10 px-1 text-2xl font-bold text-white">Fusion OS</div>

      <nav className="mt-7 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent =
            location.pathname === item.to ||
            (item.label === 'Overview' && location.pathname === '/') ||
            (item.label === 'Ventures' && location.pathname.startsWith('/ventures/'));

          return (
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                className={`flex h-14 w-full items-center gap-4 rounded-lg px-4 text-left text-base transition ${
                  location.pathname.startsWith('/email')
                    ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                <span className="font-medium">{item.label}</span>
              </a>
            ) : (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex h-14 w-full items-center gap-4 rounded-lg px-4 text-left text-base transition ${
                isCurrent
                  ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                  : 'text-zinc-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
            )
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-bold text-zinc-950">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{displayName}</div>
            <div className="text-sm text-slate-300">{displayRole}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
