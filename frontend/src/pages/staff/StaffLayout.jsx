import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const NAV_LINKS = [
  { to: '/staff',          label: 'Home',     end: true  },
  { to: '/staff/nominate', label: 'Nominate', end: false },
  { to: '/staff/vote',     label: 'Vote',     end: false },
  { to: '/staff/results',  label: 'Results',  end: false },
  { to: '/staff/profile',  label: 'Profile',  end: false },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navCls = ({ isActive }) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-[#7F622C] text-white font-semibold'
        : 'text-gray-600 hover:text-[#7F622C] hover:bg-[#7F622C]/5'
    }`;

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col">

      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
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
              <p className="text-gray-400 text-xs mt-0.5">{user?.department || 'Staff'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-[#CBD300]" />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        Kenya School of Government — Empowering the Public Service
      </footer>
    </div>
  );
}