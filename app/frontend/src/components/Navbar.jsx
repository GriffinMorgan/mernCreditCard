import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Server,
  RefreshCw,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import SpendSignalLogo from './SpendSignalLogo';
import { useAuth } from '../context/AuthContext';
import { API_ENVIRONMENTS } from '../services/api';

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
    apiEnvKey,
    changeApiEnv,
    backendStatus,
    checkBackendHealth,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname.startsWith('/dashboard');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Context-Specific Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="focus:outline-none">
            <SpendSignalLogo
              size="md"
              uppercase={true}
              portalBadge={
                isDashboard
                  ? `${(user?.role || 'Cardholder').toUpperCase()} PORTAL`
                  : isLogin
                  ? 'Sign In'
                  : null
              }
            />
          </Link>

          {/* Public Landing Page Anchors ONLY shown on "/" */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'features', label: 'Features' },
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'portals', label: 'Solutions by Role' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-navy-900/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right: API Target Switcher + Route Navigation */}
        <div className="flex items-center gap-3">
          {/* API Environment Selector & Health Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-navy-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Server className="w-3.5 h-3.5 text-signal-indigo shrink-0" />
            <select
              aria-label="Select API Environment"
              value={apiEnvKey}
              onChange={(e) => changeApiEnv(e.target.value)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {Object.values(API_ENVIRONMENTS).map((env) => (
                <option key={env.id} value={env.id} className="bg-navy-900 text-slate-200">
                  {env.label} ({env.id === 'local' ? ':5000' : 'Droplet'})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={checkBackendHealth}
              title={`API Status: ${backendStatus.message || backendStatus.state}. Click to re-ping GET /api/ping`}
              className="inline-flex items-center gap-1.5 pl-2 border-l border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.state === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : backendStatus.state === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-signal-coral'
                }`}
              />
              <span className="hidden lg:inline">
                {backendStatus.state === 'online'
                  ? `${backendStatus.latencyMs}ms`
                  : backendStatus.state === 'checking'
                  ? 'Pinging...'
                  : 'Offline'}
              </span>
              <RefreshCw
                className={`w-3 h-3 ${backendStatus.state === 'checking' ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {!isDashboard && (
                <Link
                  to="/dashboard"
                  className="signal-btn-primary text-xs sm:text-sm py-2 px-4"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-signal-coral/20 border border-slate-700/80 hover:border-signal-coral/50 text-xs font-medium text-slate-300 hover:text-signal-coral transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isLogin ? (
                <Link to="/login" className="signal-btn-primary text-xs sm:text-sm py-2 px-4">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-signal-indigo" />
                  <span>Back to Home</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
