import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { extractError } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a page refresh keeps the user logged in.
  const [user, setUser] = useState(() => storage.getUser());
  const [booting, setBooting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Session is already hydrated synchronously above; this just flips the flag.
    setBooting(false);
  }, []);

  const persistSession = useCallback((auth) => {
    storage.setToken(auth.token);
    const u = { username: auth.username, role: auth.role };
    storage.setUser(u);
    setUser(u);
  }, []);

  const login = useCallback(async (credentials) => {
    const auth = await authService.login(credentials);
    persistSession(auth);
    return auth;
  }, [persistSession]);

  const signup = useCallback(async (payload) => {
    // Backend logs the user in on signup by returning a token directly.
    const auth = await authService.signup(payload);
    persistSession(auth);
    return auth;
  }, [persistSession]);

  const logout = useCallback((opts = {}) => {
    storage.clear();
    setUser(null);
    if (opts.expired) toast.error('Session expired. Please sign in again.');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Listen for the 401 event dispatched by the Axios interceptor.
  useEffect(() => {
    const handler = () => logout({ expired: true });
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  const value = {
    user,
    isAuthenticated: !!user && !!storage.getToken(),
    booting,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export { extractError };
