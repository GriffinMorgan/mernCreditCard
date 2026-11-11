import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  fetchUserById,
  getApiBaseUrl,
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
  }, [token, user?._id]);

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

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        apiBaseUrl: getApiBaseUrl(),
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
