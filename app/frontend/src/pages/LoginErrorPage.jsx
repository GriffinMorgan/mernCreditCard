import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SpendSignalLogo from '../components/SpendSignalLogo';

export default function LoginErrorPage() {
  const location = useLocation();
  const attemptedUsername = location.state?.username || null;
  const status = location.state?.status || 401;
  const detail =
    location.state?.message || 'Unable to authenticate with the provided username and password.';

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-20 flex justify-center">
      <div className="w-full max-w-lg panel p-8 space-y-6 border-[#F85C70]/50">
        <div className="flex items-center justify-between border-b border-[#1E2B48] pb-4">
          <SpendSignalLogo size="sm" portalBadge="Authentication Error" />
          <span className="px-2.5 py-0.5 rounded bg-[#F85C70]/15 border border-[#F85C70]/40 text-xs font-mono text-[#F85C70]">
            HTTP {status}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Login Failure</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            We could not sign you in. The username or password you entered is incorrect, or the
            account does not exist.
          </p>
        </div>

        <div className="panel-inset p-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="font-mono text-[#F85C70]">Generic Login Failure ({status})</span>
          </div>
          {attemptedUsername && (
            <div className="flex justify-between">
              <span className="text-slate-400">Attempted Username</span>
              <span className="font-mono text-slate-200">{attemptedUsername}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Server Message</span>
            <span className="text-slate-300">{detail}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link to="/login" className="btn-primary flex-1 py-2.5 text-center">
            Return to Login Page
          </Link>
          <Link
            to="/login?mode=register"
            className="btn-secondary py-2.5 px-4 text-center"
          >
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}

