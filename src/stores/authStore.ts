import { create } from 'zustand';
import type { AuthTokens, User } from '@/types/api';
import { clearSession, getAccessToken, getRefreshToken, onTokensRefreshed, setSessionTokens } from '@/services/apiClient';

const USER_KEY = 'agri-go.user';
const storedUser = localStorage.getItem(USER_KEY);

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => {
  // Listen for background token refreshes from apiClient without circular dependency
  onTokensRefreshed((tokens) => {
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  });

  return {
    user: storedUser ? (JSON.parse(storedUser) as User) : null,
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    isAuthenticated: Boolean(getAccessToken() && getRefreshToken()),
    setSession: (user, tokens) => {
      setSessionTokens(tokens.accessToken, tokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isAuthenticated: true });
    },
    setTokens: (tokens) => {
      setSessionTokens(tokens.accessToken, tokens.refreshToken);
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isAuthenticated: true });
    },
    setUser: (user) => {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
      set({ user });
    },
    logout: () => {
      clearSession();
      localStorage.removeItem(USER_KEY);
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
  };
});
