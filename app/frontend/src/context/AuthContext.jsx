import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  fetchUserById,
  getApiEnvKey,
  setApiEnvKey as persistApiEnvKey,
  getApiBaseUrl,
  API_ENVIRONMENTS,
  pingBackend,
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
  const [apiEnvKey, setApiEnvState] = useState(() => getApiEnvKey());
  const [backendStatus, setBackendStatus] = useState({
    online: null,
    latencyMs: null,
    message: null,
    checkedAt: null,
  });

  const checkHealth = async () => {
    try {
      const res = await pingBackend();
      setBackendStatus({
        online: true,
        latencyMs: res.durationMs,
        message: res.data?.message || 'pong',
        checkedAt: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setBackendStatus({
        online: false,
        latencyMs: err.durationMs || null,
        message: err.message || 'Unreachable',
        checkedAt: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, [apiEnvKey]);

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

  const login = async ({ username, password }) => {
    const res = await loginUser({ username, password });
    const { token: jwtToken, user: loggedInUser } = res.data;
    localStorage.setItem(STORAGE_TOKEN_KEY, jwtToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));
    setToken(jwtToken);
    setUser(loggedInUser);
    return res;
  };

  const register = async ({ firstName, lastName, username, password, email }) => {
    const res = await registerUser({ firstName, lastName, username, password, email });
    return res;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const changeApiEnv = (nextKey) => {
    persistApiEnvKey(nextKey);
    setApiEnvState(nextKey);
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
        changeApiEnv,
        apiBaseUrl: getApiBaseUrl(),
        apiEnvironments: API_ENVIRONMENTS,
        backendStatus,
        checkHealth,
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
