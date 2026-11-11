import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SpendSignalLogo from './SpendSignalLogo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 bg-[#090E1A] border-b border-[#1A2540]">
      <div className="max-w-[1400px] mx-auto px-8 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="focus:outline-none">
            <SpendSignalLogo
              size="md"
              uppercase={true}
              portalBadge={
                isDashboard
                  ? user?.role === 'company'
                    ? 'Company Portal'
                    : user?.role === 'admin'
                    ? 'Admin'
                    : 'Cardholder Workspace'
                  : isLogin
                  ? 'Authentication'
                  : 'Platform'
              }
            />
          </Link>
        </div>

        {/* Right: Session Actions */}
        <div className="flex items-center gap-4">
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
