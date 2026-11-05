import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SpendSignalLogo from './SpendSignalLogo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
    apiEnvKey,
    changeApiEnv,
    backendStatus,
    checkHealth,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 bg-[#090E1A] border-b border-[#1A2540]">
      <div className="max-w-[1400px] mx-auto px-8 h-14 flex items-center justify-between">
        {/* Left: Logo & Context */}
        <div className="flex items-center gap-8">
          <Link to="/" className="focus:outline-none">
            <SpendSignalLogo
              size="md"
              uppercase={true}
              portalBadge={
                isDashboard
                  ? `${user?.role ? user.role : 'Workspace'}`
                  : isLogin
                  ? 'Authentication'
                  : 'Platform'
              }
            />
          </Link>
        </div>

        {/* Right: API Target & Session Actions */}
        <div className="flex items-center gap-4">
          {/* Clean API Connection Indicator */}
          <div className="flex items-center gap-2 bg-[#0D1424] border border-[#1E2B48] rounded-md px-2.5 py-1 text-xs">
            <button
              type="button"
              onClick={checkHealth}
              title="Click to test API connection"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus.online === true
                    ? 'bg-emerald-400'
                    : backendStatus.online === false
                    ? 'bg-[#F85C70]'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px] text-slate-400">
                {backendStatus.online === true
                  ? `${backendStatus.latencyMs}ms`
                  : backendStatus.online === false
                  ? 'Offline'
                  : 'Checking'}
              </span>
            </button>

            <span className="text-[#1E2B48]">|</span>

            <select
              value={apiEnvKey}
              onChange={(e) => changeApiEnv(e.target.value)}
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
              aria-label="Select API Environment"
            >
              <option value="local" className="bg-[#0D1424] text-white">
                Local (:5000)
              </option>
              <option value="production" className="bg-[#0D1424] text-white">
                Production
              </option>
            </select>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#1A2540]">
              <span className="text-xs text-slate-400">
                Signed in as <strong className="text-slate-200">@{user.username}</strong>
              </span>
              {!isDashboard && (
                <Link to="/dashboard" className="btn-primary text-xs py-1.5 px-3.5">
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1A2540]">
              {!isLogin ? (
                <>
                  <Link to="/login" className="btn-secondary text-xs py-1.5 px-3.5">
                    Sign in
                  </Link>
                  <Link
                    to="/login?mode=register"
                    className="btn-primary text-xs py-1.5 px-3.5"
                  >
                    Create account
                  </Link>
                </>
              ) : (
                <Link to="/" className="btn-secondary text-xs py-1.5 px-3.5">
                  ← Overview
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
