import { NavLink } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { to: '/accounts', label: 'Accounts', icon: Icon.Wallet },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: Icon.Users },
  { to: '/transfer/rtgs', label: 'RTGS Transfer', icon: Icon.Bolt },
  { to: '/transfer/neft', label: 'NEFT Transfer', icon: Icon.Send },
  { to: '/transactions', label: 'Transactions', icon: Icon.List },
];

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col bg-ink-900 text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-ink-900 shadow-glow">
          <Icon.Shield className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold text-white">Meridian</p>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Banking Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: IconC }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <IconC className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 font-semibold text-white">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-[11px] text-slate-500">{user?.role?.replace('ROLE_', '')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
