import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const NAV_LINKS = [
  { to: '/management',             label: 'Overview',    end: true  },
  { to: '/management/cycles',      label: 'Cycles',      end: false },
  { to: '/management/nominations', label: 'Nominations', end: false },
  { to: '/management/results',     label: 'Results',     end: false },
  { to: '/management/users',       label: 'Users',       end: false },
  { to: '/management/profile',     label: 'Profile',     end: false },
];

export default function ManagementLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navCls = ({ isActive }) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-[#CBD300] text-[#3d2e00] font-semibold'
        : 'text-white/75 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col">

      <header className="bg-[#7F622C] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 shrink-0">
            <img src="/ksg-logo.png" alt="KSG" className="h-8 w-auto brightness-0 invert" />
            <span className="hidden sm:block text-white/30 text-xs font-medium border-l border-white/20 pl-3">
              Admin
            </span>
          </div>

          <nav className="flex gap-0.5 flex-wrap justify-center">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navCls}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-white text-xs font-semibold leading-none">{user?.name}</p>
              <p className="text-[#CBD300] text-xs mt-0.5">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-md px-3 py-1.5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-[#CBD300]" />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        Kenya School of Government — Admin Panel
      </footer>
    </div>
  );
}