import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENVIRONMENTS } from '../services/api';

// Seeded accounts from mernCreditCard/app/databaseSchema/CreditCard.js
const DEMO_USERS = [
  {
    username: 'alice',
    password: 'AliceDemo#2026',
    name: 'Alice Nguyen',
    detail: '2 cards · Everyday Cash, Travel Rewards',
  },
  {
    username: 'brian',
    password: 'BrianDemo#2026',
    name: 'Brian Carter',
    detail: '1 card · Student Starter Visa',
  },
  {
    username: 'carla',
    password: 'CarlaDemo#2026',
    name: 'Carla Mendez',
    detail: '1 card · Amex Platinum (Frozen)',
  },
];

export default function LoginPage() {
  const {
    login,
    register,
    isAuthenticated,
    apiEnvKey,
    apiEnv,
    changeApiEnv,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('AliceDemo#2026');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSelectDemoUser = (demo) => {
    setMode('login');
    setUsername(demo.username);
    setPassword(demo.password);
    setErrorBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ username: username.trim(), password });
      } else {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          password,
          email: email.trim(),
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorBanner({
        status: err.status || 'Network Error',
        message: err.message || 'Could not reach the Express backend.',
        url: err.url || `${apiEnv.baseUrl}/api/users/${mode === 'login' ? 'login' : 'create'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-14">
      <div className="grid grid-cols-12 gap-12 items-start">
        {/* LEFT 6 COLS: Clean Institutional Sign-In / Registration Panel */}
        <div className="col-span-6">
          <div className="panel p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#1E2B48] pb-5">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {mode === 'login' ? 'Sign in to SpendSignal' : 'Create your account'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login'
                    ? 'Enter your credentials to access your dashboard.'
                    : 'Register a new user account via POST /api/users/create.'}
                </p>
              </div>

              <div className="inline-flex p-0.5 rounded bg-[#090E1A] border border-[#1E2B48]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorBanner(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                    mode === 'login'
                      ? 'bg-[#7E8EF7] text-[#090E1A] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setUsername('');
                    setPassword('');
                    setErrorBanner(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                    mode === 'register'
                      ? 'bg-[#7E8EF7] text-[#090E1A] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {errorBanner && (
              <div className="p-3.5 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs space-y-1">
                <div className="font-semibold text-[#F85C70]">
                  Authentication Failed ({errorBanner.status})
                </div>
                <div className="text-slate-200">{errorBanner.message}</div>
                <div className="text-slate-500 font-mono text-[11px]">{errorBanner.url}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alice"
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nguyen"
                      className="field-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alice"
                  className="field-input"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@example.com"
                    className="field-input"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-input font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5"
                >
                  {loading
                    ? mode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                </button>
              </div>
            </form>

            {/* Target Backend Selector */}
            <div className="pt-4 border-t border-[#1E2B48] flex items-center justify-between text-xs text-slate-400">
              <span>
                API Target: <code className="text-slate-300 font-mono">{apiEnv.baseUrl}</code>
              </span>
              <div className="flex items-center gap-2">
                {Object.values(API_ENVIRONMENTS).map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => changeApiEnv(env.id)}
                    className={`px-2.5 py-1 rounded text-[11px] border ${
                      apiEnvKey === env.id
                        ? 'bg-[#182442] border-[#7E8EF7] text-white'
                        : 'bg-[#0B1120] border-[#1E2B48] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {env.id === 'local' ? 'Local (:5000)' : 'Droplet'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: Seeded Test Accounts Table & Workspace Routing Info */}
        <div className="col-span-6 space-y-6">
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2B48] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Seeded Database Accounts</h2>
                <p className="text-xs text-slate-400">
                  Defined in <code>app/databaseSchema/CreditCard.js</code> — click a row to autofill
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">creditcardapp.users</span>
            </div>

            <div className="divide-y divide-[#1A2540] text-xs">
              {DEMO_USERS.map((demo) => {
                const isSelected = username === demo.username && password === demo.password;
                return (
                  <button
                    key={demo.username}
                    type="button"
                    onClick={() => handleSelectDemoUser(demo)}
                    className={`w-full text-left py-3 px-3 rounded flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-[#16213B]' : 'hover:bg-[#16213B]/50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {demo.name}{' '}
                        <span className="font-mono text-[#7E8EF7] ml-1">@{demo.username}</span>
                      </div>
                      <div className="text-slate-400 mt-0.5">{demo.detail}</div>
                    </div>
                    <div className="text-right">
                      <code className="text-[11px] font-mono text-slate-300 bg-[#090E1A] px-2 py-1 rounded border border-[#1E2B48]">
                        {demo.password}
                      </code>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Role-Based Workspace Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              After signing in, your session is directed to <code>/dashboard</code> where your
              assigned role determines your default workspace view:
            </p>
            <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
              <div className="panel-inset p-3">
                <div className="font-semibold text-white">Cardholder</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Cards ledger, balances, ROI &amp; leakage
                </div>
              </div>
              <div className="panel-inset p-3">
                <div className="font-semibold text-white">Merchant</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Spend Opportunity Report &amp; lift
                </div>
              </div>
              <div className="panel-inset p-3">
                <div className="font-semibold text-white">Partner</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  API Sandbox &amp; cohort analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
