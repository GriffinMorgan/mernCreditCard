import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  fetchUserById,
  pingBackend,
  getSelectedEnvKey,
  setSelectedEnvKey,
  API_ENVIRONMENTS,
} from '../services/api';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'spendsignal_token';
const STORAGE_USER_KEY = 'spendsignal_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [apiEnvKey, setApiEnvKeyState] = useState(getSelectedEnvKey);
  const [backendStatus, setBackendStatus] = useState({
    state: 'checking', // 'checking' | 'online' | 'offline'
    latencyMs: null,
    message: null,
  });
  const [lastAuthResponse, setLastAuthResponse] = useState(null);

  const checkBackendHealth = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, state: 'checking' }));
    try {
      const res = await pingBackend();
      setBackendStatus({
        state: 'online',
        latencyMs: res.durationMs,
        message: res.data?.message || 'OK',
      });
      return true;
    } catch (err) {
      setBackendStatus({
        state: 'offline',
        latencyMs: null,
        message: err.message || 'Unreachable',
      });
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, [apiEnvKey, checkBackendHealth]);

  // Verify stored session against GET /api/users/:userId when token exists
  useEffect(() => {
    let active = true;
    async function verifySession() {
      if (!token || !user?._id) return;
      try {
        const res = await fetchUserById(user._id);
        if (active && res.data) {
          setUser(res.data);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.data));
        }
      } catch (err) {
        if (active && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [token, user?._id, apiEnvKey]);

  const changeApiEnv = (newKey) => {
    setSelectedEnvKey(newKey);
    setApiEnvKeyState(newKey);
  };

  const login = async ({ username, password }) => {
    const res = await loginUser({ username, password });
    const { token: jwtToken, user: loggedInUser } = res.data;
    localStorage.setItem(STORAGE_TOKEN_KEY, jwtToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));
    setToken(jwtToken);
    setUser(loggedInUser);
    setLastAuthResponse({
      endpoint: 'POST /api/users/login',
      status: res.status,
      durationMs: res.durationMs,
      url: res.url,
      payload: res.data,
      timestamp: new Date().toLocaleTimeString(),
    });
    return res;
  };

  const register = async ({ firstName, lastName, username, password, email }) => {
    const res = await registerUser({ firstName, lastName, username, password, email });
    const { token: jwtToken, user: createdUser } = res.data;
    localStorage.setItem(STORAGE_TOKEN_KEY, jwtToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(createdUser));
    setToken(jwtToken);
    setUser(createdUser);
    setLastAuthResponse({
      endpoint: 'POST /api/users/create',
      status: res.status,
      durationMs: res.durationMs,
      url: res.url,
      payload: res.data,
      timestamp: new Date().toLocaleTimeString(),
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
    setLastAuthResponse(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        apiEnvKey,
        apiEnv: API_ENVIRONMENTS[apiEnvKey],
        changeApiEnv,
        backendStatus,
        checkBackendHealth,
        lastAuthResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}

