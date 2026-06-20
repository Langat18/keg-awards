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
    `px-3 py-1.5 text-sm font-medium rounded transition-colors ${
      isActive
        ? 'bg-[#7F622C] text-white font-semibold'
        : 'text-gray-600 hover:text-[#7F622C] hover:bg-[#7F622C]/5'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <img src="/ksg-logo.png" alt="KSG" className="h-9 w-auto shrink-0" />
          <nav className="flex gap-0.5">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navCls}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-gray-800 text-xs font-semibold leading-none">{user?.name}</p>
              <p className="text-[#7F622C] text-xs mt-0.5 font-medium">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded px-3 py-1.5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-[#CBD300]" />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Kenya School of Government &mdash; Administration Panel
      </footer>
    </div>
  );
}