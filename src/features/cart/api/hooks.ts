import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ApiResponse, Cart } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';

export const cartQueryKey = ['cart'] as const;

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({ queryKey: cartQueryKey, enabled: isAuthenticated, queryFn: async () => (await apiClient.get<ApiResponse<Cart>>('/cart')).data.data });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { productId: number; quantity: number }) => apiClient.post<ApiResponse<Cart>>('/cart/items', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => apiClient.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => apiClient.delete<ApiResponse<Cart>>(`/cart/items/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete<ApiResponse<Cart>>('/cart'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}
