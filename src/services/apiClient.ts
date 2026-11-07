import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const ACCESS_TOKEN_KEY = 'agri-go.access-token';
export const REFRESH_TOKEN_KEY = 'agri-go.refresh-token';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export function setSessionTokens(accessToken: string, refreshToken: string) { localStorage.setItem(ACCESS_TOKEN_KEY, accessToken); localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); }
export function clearSession() { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); }

type TokenListener = (tokens: { accessToken: string; refreshToken: string }) => void;
const tokenListeners = new Set<TokenListener>();

export const onTokensRefreshed = (cb: TokenListener) => {
  tokenListeners.add(cb);
  return () => { tokenListeners.delete(cb); };
};

export const notifyTokensRefreshed = (tokens: { accessToken: string; refreshToken: string }) => {
  tokenListeners.forEach((cb) => cb(tokens));
};

export const apiClient = axios.create({ baseURL: API_URL, timeout: 15_000 });
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');
  const response = await axios.post<{ data: { tokens: { accessToken: string; refreshToken: string } } }>(`${API_URL}/auth/refresh`, { refreshToken });
  const tokens = response.data.data.tokens;
  setSessionTokens(tokens.accessToken, tokens.refreshToken);
  notifyTokensRefreshed(tokens);
  return tokens.accessToken;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // Let Axios/browser add the multipart boundary automatically.
    config.headers.delete('Content-Type');
    config.headers.delete('content-type');
  }
  return config;
});

apiClient.interceptors.response.use((response) => response, async (error: AxiosError<{ message?: string }>) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  const isRefreshRequest = original?.url?.endsWith('/auth/refresh');
  if (error.response?.status === 401 && original && !original._retry && !isRefreshRequest) {
    original._retry = true;
    try {
      refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
      const accessToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(new Error(error.response?.data?.message ?? error.message));
});

export { apiClient as api };
