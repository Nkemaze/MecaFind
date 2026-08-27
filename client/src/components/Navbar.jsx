import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/find', label: 'Find Mechanics' },
  { to: '/usage', label: 'My Usage' },
  { to: '/payments', label: 'Payments' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const navItemClass = ({ isActive }) =>
    `relative text-[13px] font-semibold uppercase tracking-wider transition-colors py-1 ${
      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
    } after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:transition-all after:duration-200 ${
      isActive ? 'after:bg-primary after:scale-x-100' : 'after:bg-primary after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border-b border-outline-variant/50'
          : 'bg-white/80 backdrop-blur-xl border-b border-outline-variant/30'
      }`}>
        <div className="h-[72px] max-w-[1280px] mx-auto px-5 lg:px-16 flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/mecafind-logo.png" alt="MecaFind" className="h-10 w-10 rounded-xl object-cover" />
              <span className="font-bold text-lg text-primary tracking-tight hidden sm:block">MecaFind</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={navItemClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: CTA + User */}
          <div className="flex items-center gap-3">
            <Link
              to="/find"
              className="hidden md:inline-flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-primary-container hover:shadow-md transition-all"
            >
              <Icon name="search" size="text-[16px]" /> Find a Mechanic
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <Icon name={menuOpen ? 'expand_less' : 'expand_more'} size="text-[18px]" className="text-on-surface-variant" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-xl shadow-xl border border-outline-variant/40 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-outline-variant/30">
                      <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {user.role === 'car_owner' ? 'Car Owner' : user.role === 'mechanic' ? 'Mechanic' : 'Admin'}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      {(user.role === 'mechanic' || user.role === 'admin') && (
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                          <Icon name="dashboard" size="text-[18px]" /> Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                          <Icon name="admin_panel_settings" size="text-[18px]" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/change-password" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <Icon name="password" size="text-[18px]" /> Change Password
                      </Link>
                      <Link to="/usage" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <Icon name="token" size="text-[18px]" /> My Usage
                      </Link>
                      <Link to="/payments" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <Icon name="payments" size="text-[18px]" /> Payments
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-outline-variant/30 pt-1">
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors"
                      >
                        <Icon name="logout" size="text-[18px]" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/signin"
                className="text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size="text-[24px]" className="text-on-surface" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`lg:hidden fixed inset-0 top-[72px] z-40 transition-all duration-300 ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />

        {/* Panel */}
        <div className={`relative bg-white border-b border-outline-variant shadow-xl transition-transform duration-300 ${
          mobileOpen ? 'translate-y-0' : '-translate-y-4'
        }`}>
          <nav className="max-w-[1280px] mx-auto px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={isActive ? link.to === '/' ? 'home' : link.to === '/find' ? 'search' : link.to === '/usage' ? 'token' : 'payments' : link.to === '/' ? 'home' : link.to === '/find' ? 'search' : link.to === '/usage' ? 'token' : 'payments'} size="text-[20px]" />
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}

            {user && (user.role === 'mechanic' || user.role === 'admin') && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
                <Icon name="dashboard" size="text-[20px]" /> Dashboard
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
                <Icon name="admin_panel_settings" size="text-[20px]" /> Admin Panel
              </Link>
            )}

            {!user && (
              <div className="pt-2 border-t border-outline-variant/30 mt-2">
                <Link to="/auth/signin" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-semibold">
                  <Icon name="login" size="text-[18px]" /> Sign In
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
