import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

        {/* Right: Environment Selector + Session Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#11192E] border border-[#1E2B48] rounded-md px-2.5 py-1 text-xs">
            <span className="text-slate-500">API</span>
            <select
              aria-label="Select API Environment"
              value={apiEnvKey}
              onChange={(e) => changeApiEnv(e.target.value)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              {Object.values(API_ENVIRONMENTS).map((env) => (
                <option key={env.id} value={env.id} className="bg-[#090E1A] text-slate-200">
                  {env.id === 'local' ? 'localhost:5000' : 'mern.teedlej.com'}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={checkBackendHealth}
              title="Click to ping GET /api/ping"
              className="inline-flex items-center gap-1.5 pl-2 border-l border-[#1E2B48] text-slate-400 hover:text-slate-200"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus.state === 'online'
                    ? 'bg-emerald-400'
                    : backendStatus.state === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-[#F85C70]'
                }`}
              />
              <span className="tabular-nums text-[11px]">
                {backendStatus.state === 'online'
                  ? `${backendStatus.latencyMs}ms`
                  : backendStatus.state === 'checking'
                  ? '...'
                  : 'offline'}
              </span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2.5">
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
