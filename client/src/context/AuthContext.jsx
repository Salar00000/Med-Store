import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medstore_user')) || null; } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('medstore_user', JSON.stringify(user));
  }, [user]);

  const login = useCallback((u, t) => {
    localStorage.setItem('medstore_token', t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medstore_token');
    localStorage.removeItem('medstore_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
