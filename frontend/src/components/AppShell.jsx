import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Avatar from './Avatar';
import Icon from './Icon';

function UserMenu({ profilePath, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-canvas"
      >
        <Avatar name={user?.name} size="sm" />
        <span className="hidden text-left lg:block">
          <span className="block max-w-[160px] truncate text-sm font-semibold leading-tight">{user?.name}</span>
          <span className="block text-xs leading-tight text-muted">{subtitle}</span>
        </span>
        <Icon name="chevronDown" className="hidden h-4 w-4 text-muted lg:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-white shadow-lg shadow-brand-ink/10">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <Link to={profilePath} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-canvas">
            <Icon name="user" className="h-4 w-4 text-muted" /> Profile and password
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-canvas">
            <Icon name="logout" className="h-4 w-4 text-muted" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ links, profilePath, subtitle, areaLabel }) {
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand text-white' : 'text-muted hover:bg-brand/5 hover:text-brand'
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setDrawer(true)}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded text-brand-ink hover:bg-canvas md:hidden"
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>

          <div className="flex shrink-0 items-center gap-3">
            <Link to={links[0].to}>
              <img src="/ksg-logo.png" alt="Kenya School of Government, home" className="h-9 w-auto" />
            </Link>
            {areaLabel && (
              <span className="hidden rounded-full bg-lime-tint px-2.5 py-0.5 text-xs font-semibold text-brand-dark xl:inline">{areaLabel}</span>
            )}
          </div>

          <nav className="ml-4 hidden flex-1 gap-1 md:flex" aria-label="Main">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto">
            <UserMenu profilePath={profilePath} subtitle={subtitle} />
          </div>
        </div>
        <div className="h-[3px] bg-lime" />
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 bg-brand-ink/40 md:hidden" onClick={() => setDrawer(false)}>
          <nav
            aria-label="Main"
            onClick={e => e.stopPropagation()}
            className="flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-8 w-auto" />
              <button onClick={() => setDrawer(false)} className="flex h-10 w-10 items-center justify-center rounded hover:bg-canvas" aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-semibold ${
                      isActive ? 'bg-lime-tint text-brand-ink' : 'text-muted hover:bg-canvas'
                    }`
                  }
                >
                  <Icon name={link.icon} className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>Kenya School of Government, Mombasa Campus</p>
          <p>Staff Rewards and Recognition</p>
        </div>
      </footer>
    </div>
  );
}
