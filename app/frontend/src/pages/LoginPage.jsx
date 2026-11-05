import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Server,
  RefreshCw,
} from 'lucide-react';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';
import { API_ENVIRONMENTS } from '../services/api';

// Seeded accounts from mernCreditCard/app/databaseSchema/CreditCard.js
const DEMO_USERS = [
  {
    username: 'alice',
    password: 'AliceDemo#2026',
    name: 'Alice Nguyen',
    cards: '2 Cards (Everyday Cash, Travel Rewards)',
    badgeColor: 'border-signal-indigo/40 bg-signal-indigo/10 text-signal-indigo',
  },
  {
    username: 'brian',
    password: 'BrianDemo#2026',
    name: 'Brian Carter',
    cards: '1 Card (Student Starter Visa)',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  {
    username: 'carla',
    password: 'CarlaDemo#2026',
    name: 'Carla Mendez',
    cards: '1 Card (Amex Platinum - Frozen)',
    badgeColor: 'border-signal-coral/40 bg-signal-coral/10 text-signal-coral',
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
    backendStatus,
    checkBackendHealth,
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

  // If already logged in, redirect straight to the user's dashboard
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
      // Redirect immediately to the role-based dashboard on success
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-signal-indigo/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-24 w-96 h-96 rounded-full bg-signal-coral/10 blur-3xl" />

      <div className="w-full max-w-xl">
        <div className="signal-card p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-signal-indigo mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>SpendSignal Account Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Sign in to access your role-based SpendSignal dashboard.'
                  : 'Register a new account and go straight to your dashboard.'}
              </p>
            </div>

            {/* Sign In / Register Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-navy-900 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorBanner(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-signal-indigo text-navy-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setUsername('');
                  setPassword('');
                  setErrorBanner(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-signal-indigo text-navy-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Backend Environment Bar */}
          <div className="mt-5 p-3 rounded-xl bg-navy-900/90 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Server className="w-3.5 h-3.5 text-signal-indigo shrink-0" />
              <span className="text-slate-400">API:</span>
              <code className="text-slate-200 font-mono bg-navy-800 px-2 py-0.5 rounded border border-slate-700/70">
                {apiEnv.baseUrl}
              </code>
            </div>

            <div className="flex items-center gap-1.5">
              {Object.values(API_ENVIRONMENTS).map((env) => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => changeApiEnv(env.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    apiEnvKey === env.id
                      ? 'bg-signal-indigo/20 border-signal-indigo text-white'
                      : 'bg-navy-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {env.id === 'local' ? 'Local (:5000)' : 'Production Droplet'}
                </button>
              ))}
              <button
                type="button"
                onClick={checkBackendHealth}
                className="p-1.5 rounded-lg bg-navy-850 border border-slate-800 text-slate-400 hover:text-white"
                title="Ping GET /api/ping"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    backendStatus.state === 'checking' ? 'animate-spin text-signal-indigo' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick-Fill Seeded Demo Users */}
          {mode === 'login' && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quick-Fill Demo Accounts (from CreditCard.js)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_USERS.map((demo) => {
                  const isSelected = username === demo.username && password === demo.password;
                  return (
                    <button
                      key={demo.username}
                      type="button"
                      onClick={() => handleSelectDemoUser(demo)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-navy-800 border-signal-indigo shadow-glow'
                          : 'bg-navy-900/60 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">@{demo.username}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${demo.badgeColor}`}
                        >
                          Select
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{demo.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{demo.cards}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorBanner && (
            <div className="mt-5 p-4 rounded-xl bg-signal-coral/15 border border-signal-coral/40 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-signal-coral shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-semibold text-white">
                  Sign-In Failed ({errorBanner.status})
                </div>
                <p className="text-slate-200">{errorBanner.message}</p>
                <p className="text-slate-400 font-mono text-[11px]">Endpoint: {errorBanner.url}</p>
              </div>
            </div>
          )}

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alice"
                    className="signal-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyen"
                    className="signal-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username <span className="text-signal-coral">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. alice)"
                  className="signal-input pl-10"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@example.com"
                    className="signal-input pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password <span className="text-signal-coral">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="signal-input pl-10 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="signal-btn-primary w-full py-3 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {mode === 'login' ? 'Signing in...' : 'Creating your account...'}
                    </span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Continue'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <SpendSignalLogo size="sm" />
            <Link to="/" className="text-signal-indigo hover:underline font-medium">
              ← Return to Public Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
