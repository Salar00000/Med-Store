import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medstore_user')) || null; } catch { return null; }
  });
  const [checking, setChecking] = useState(() => !!localStorage.getItem('medstore_token'));

  // On mount: if a token exists, verify it against the API.
  // This prevents a stale localStorage token from granting access.
  useEffect(() => {
    const token = localStorage.getItem('medstore_token');
    if (!token) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    fetchMe()
      .then((freshUser) => {
        if (cancelled) return;
        setUser(freshUser);
        localStorage.setItem('medstore_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        if (cancelled) return;
        // Token is invalid — clear everything
        localStorage.removeItem('medstore_token');
        localStorage.removeItem('medstore_user');
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('medstore_user', JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback((u, t) => {
    localStorage.setItem('medstore_token', t);
    localStorage.setItem('medstore_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medstore_token');
    localStorage.removeItem('medstore_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, checking }), [user, login, logout, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
