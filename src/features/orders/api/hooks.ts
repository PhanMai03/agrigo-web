import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ApiResponse, BuyNowInput, CheckoutInput, CheckoutResult, Order, OrderStatus, PaginatedResponse, PaymentLink, PaymentStatus } from '@/types/api';

export const ordersQueryKey = ['orders'] as const;
export interface OrdersQuery { page?: number; perPage?: number; orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }

export function useOrders(params: OrdersQuery = {}) {
  return useQuery({ queryKey: [...ordersQueryKey, params], queryFn: async () => (await apiClient.get<PaginatedResponse<Order>>('/orders', { params })).data });
}

export function useOrderDetail(id: number | undefined) {
  return useQuery({ queryKey: [...ordersQueryKey, id], enabled: id !== undefined, queryFn: async () => (await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)).data.data });
}

function redirectToPayment(result: CheckoutResult) {
  if (result.payment?.paymentUrl && typeof window !== 'undefined') window.location.assign(result.payment.paymentUrl);
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CheckoutInput) => (await apiClient.post<ApiResponse<CheckoutResult>>('/orders/checkout', body)).data.data,
    onSuccess: (result) => { queryClient.invalidateQueries({ queryKey: ['cart'] }); queryClient.invalidateQueries({ queryKey: ordersQueryKey }); redirectToPayment(result); },
  });
}

export function useBuyNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: BuyNowInput) => (await apiClient.post<ApiResponse<CheckoutResult>>('/orders/buy-now', body)).data.data,
    onSuccess: (result) => { queryClient.invalidateQueries({ queryKey: ['cart'] }); queryClient.invalidateQueries({ queryKey: ordersQueryKey }); redirectToPayment(result); },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ordersQueryKey }); queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, variables.id] }); queryClient.invalidateQueries({ queryKey: ['cart'] }); },
  });
}

export function useRetryVNPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => (await apiClient.post<ApiResponse<PaymentLink>>(`/orders/${orderId}/payment`)).data.data,
    onSuccess: (payment) => { queryClient.invalidateQueries({ queryKey: ordersQueryKey }); if (typeof window !== 'undefined') window.location.assign(payment.paymentUrl); },
  });
}
