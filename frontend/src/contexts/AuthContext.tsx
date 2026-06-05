import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User, UserRole } from '@/types';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<User>;
  register: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  }) => Promise<User>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storage.getUser<User>());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const setSession = useCallback((token: string, nextUser: User) => {
    storage.setToken(token);
    storage.setUser(nextUser);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (loginId: string, password: string) => {
    const { data } = await authService.login({ login: loginId, password });
    setSession(data.token, data.user);
    return data.user;
  }, [setSession]);

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      phone: string;
      password: string;
    }) => {
      const { data } = await authService.register(payload);
      setSession(data.token, data.user);
      return data.user;
    },
    [setSession]
  );

  const logout = useCallback(() => {
    storage.clearAuth();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user && !!storage.getToken(),
      login,
      register,
      setSession,
      logout,
      hasRole,
    }),
    [user, isLoading, login, register, setSession, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
