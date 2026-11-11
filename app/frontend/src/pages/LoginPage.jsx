import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePasswordRules } from '../services/api';

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const passwordCheck = validatePasswordRules(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner(null);
    setRegisteredSuccess(null);

    if (mode === 'register') {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        setErrorBanner({
          status: 400,
          message: 'Username must be between 3 and 30 characters.',
        });
        return;
      }
      if (!passwordCheck.valid) {
        setErrorBanner({
          status: 400,
          message: passwordCheck.error,
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ username: username.trim(), password });
        navigate('/dashboard', { replace: true });
      } else {
        const cleanUsername = username.trim();
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: cleanUsername,
          password,
          email: email.trim(),
        });
        setMode('login');
        setUsername(cleanUsername);
        setPassword('');
        setRegisteredSuccess(
          `Account "@${cleanUsername}" registered successfully. Enter your password below to sign in.`
        );
      }
    } catch (err) {
      if (mode === 'login') {
        navigate('/login-error', {
          state: {
            username: username.trim(),
            status: err.status || 401,
            message: err.message || 'Invalid username or password',
          },
        });
      } else {
        setErrorBanner({
          status: err.status || 'Registration Error',
          message: err.message || 'Could not register account.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-14 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="panel p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-[#1E2B48] pb-5">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Sign in to SpendSignal' : 'Create a New Account'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Enter your credentials to access your assigned portal.'
                  : 'Complete the fields below to register your account.'}
              </p>
            </div>

            <div className="inline-flex p-0.5 rounded bg-[#090E1A] border border-[#1E2B48] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorBanner(null);
                }}
                className={`px-3 py-1.5 rounded-xs text-xs font-medium transition-colors ${
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
                  setRegisteredSuccess(null);
                }}
                className={`px-3 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-[#7E8EF7] text-[#090E1A] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {registeredSuccess && (
            <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300">
              {registeredSuccess}
            </div>
          )}

          {errorBanner && (
            <div className="p-3.5 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs space-y-1">
              <div className="font-semibold text-[#F85C70]">
                Registration Error ({errorBanner.status})
              </div>
              <div className="text-slate-200">{errorBanner.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    First name <span className="text-[#F85C70]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Last name <span className="text-[#F85C70]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="field-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username / Login <span className="text-[#F85C70]">*</span>
              </label>
              <input
                type="text"
                required
                minLength={mode === 'register' ? 3 : undefined}
                maxLength={mode === 'register' ? 30 : undefined}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'register' ? '3–30 characters' : 'Enter your username'}
                className="field-input"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email address <span className="text-[#F85C70]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="field-input"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password <span className="text-[#F85C70]">*</span>
                </label>
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
                placeholder={
                  mode === 'register'
                    ? 'Min 8 chars + 1 special character (e.g. #!@)'
                    : 'Enter your password'
                }
                className="field-input font-mono"
              />

              {mode === 'register' && (
                <div className="mt-2 p-2.5 rounded bg-[#0B1120] border border-[#1E2B48] space-y-1 text-[11px]">
                  <div className="text-slate-400 font-medium">Password Requirements:</div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordCheck.minLengthOk ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{passwordCheck.minLengthOk ? '✓' : '○'}</span>
                    <span>At least 8 characters long</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordCheck.hasSpecialChar ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{passwordCheck.hasSpecialChar ? '✓' : '○'}</span>
                    <span>Contains at least one special character (e.g. ! @ # $ %)</span>
                  </div>
                </div>
              )}
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
                    : 'Registering account...'
                  : mode === 'login'
                  ? 'Sign in'
                  : 'Register new account'}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#1E2B48] text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setUsername('');
                    setPassword('');
                    setErrorBanner(null);
                    setRegisteredSuccess(null);
                  }}
                  className="text-[#7E8EF7] hover:underline font-medium"
                >
                  Register for a new account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorBanner(null);
                  }}
                  className="text-[#7E8EF7] hover:underline font-medium"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
