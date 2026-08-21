import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Activity, LogOut, Cpu, Target, BookOpen, Clock, FileText, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Technologies', path: '/technologies', icon: Cpu },
        { name: 'Goals', path: '/goals', icon: Target },
        { name: 'Resources', path: '/resources', icon: BookOpen },
        { name: 'Sessions', path: '/sessions', icon: Clock },
        { name: 'Notes', path: '/notes', icon: FileText },
      ]
    : [
        { name: 'Overview', path: '/' },
        { name: 'System Status', path: '/status' },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              DevTrack
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                v1.0
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Secure Developer Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = (link as any).icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-surface'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dark-700 bg-dark-800/80 hover:border-brand-500/40 text-xs font-medium text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-[11px] font-bold">
                  {user.username.substring(0, 1).toUpperCase()}
                </div>
                <span className="hidden lg:inline font-mono text-dark-200">@{user.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-700 bg-dark-800/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-xs font-medium text-dark-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-dark-200 hover:text-white hover:bg-dark-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          <Link
            to="/status"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800/80 border border-dark-700 hover:border-brand-500/40 text-xs font-medium text-dark-300 hover:text-white transition-all"
            title="System Health"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </Link>
        </div>
      </div>
    </header>
  );
};
