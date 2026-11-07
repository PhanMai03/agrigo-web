import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, setSessionTokens } from '@/services/apiClient';
import type { ApiResponse, AuthSession, User } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';

const sessionKey = ['current-user'] as const;

function saveSession(response: ApiResponse<AuthSession>) {
  setSessionTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
  return response.data;
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: async (body: { fullName: string; email: string; password: string; phone?: string }) => { const session = saveSession((await apiClient.post<ApiResponse<AuthSession>>('/auth/register', body)).data); setSession(session.user, session.tokens); return session; } });
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: async (body: { email: string; password: string }) => { const session = saveSession((await apiClient.post<ApiResponse<AuthSession>>('/auth/login', body)).data); setSession(session.user, session.tokens); return session; } });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({ mutationFn: async () => { const refreshToken = localStorage.getItem('agri-go.refresh-token'); if (refreshToken) await apiClient.post('/auth/logout', { refreshToken }); logout(); } });
}

export function useVerifyEmail() { return useMutation({ mutationFn: (body: { email: string; code: string }) => apiClient.post('/auth/verify-email', body) }); }
export function useForgotPassword() { return useMutation({ mutationFn: (body: { email: string }) => apiClient.post('/auth/forgot-password', body) }); }
export function useResetPassword() { return useMutation({ mutationFn: (body: { email: string; code: string; newPassword: string }) => apiClient.post('/auth/reset-password', body) }); }
export function useResendVerification() { return useMutation({ mutationFn: (body: { email: string }) => apiClient.post('/auth/resend-verification', body) }); }
export function useChangePassword() { const logout = useAuthStore((state) => state.logout); return useMutation({ mutationFn: (body: { currentPassword: string; newPassword: string }) => apiClient.put('/auth/password', body), onSuccess: () => logout() }); }

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  return useQuery({ queryKey: sessionKey, enabled: Boolean(useAuthStore.getState().isAuthenticated), queryFn: async () => { const user = (await apiClient.get<ApiResponse<User>>('/me')).data.data; setUser(user); return user; } });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { fullName?: string; phone?: string | null; address?: string | null; avatarUrl?: string | null }) => apiClient.put<ApiResponse<User>>('/me', body),
    onSuccess: (response) => queryClient.setQueryData(sessionKey, response.data.data),
  });
}
