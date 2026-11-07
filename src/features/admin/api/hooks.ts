import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useToastStore } from '@/stores/toastStore';
import type { ApiResponse, Category, InventoryHistory, Order, PaginatedResponse, Product, ProductImage, RefundItem, RefundsQuery, User } from '@/types/api';

const notify = (message: string) => useToastStore.getState().push({ type: 'success', message });
const fail = (error: any) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'An error occurred. Please try again.';
  useToastStore.getState().push({ type: 'error', message });
};

export interface AdminProductsQuery { page?: number; perPage?: number; q?: string; categoryId?: number; status?: 'active' | 'inactive'; minPrice?: number; maxPrice?: number; sort?: 'newest' | 'price_asc' | 'price_desc' | 'name' }
export function useAdminProducts(params: AdminProductsQuery = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['admin-products', query], queryFn: async () => (await apiClient.get<PaginatedResponse<Product>>('/products', { params: query })).data });
}
export function useCreateProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: { categoryId: number; name: string; description?: string | null; price: number; discountPercent?: number; quantity?: number; unit?: string; status?: 'active' | 'inactive' }) => apiClient.post<ApiResponse<Product>>('/products', body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); notify('Product created successfully.'); }, onError: fail }); }
export function useUpdateProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...body }: { id: number; categoryId?: number; name?: string; description?: string | null; price?: number; discountPercent?: number; unit?: string; status?: 'active' | 'inactive' }) => apiClient.put<ApiResponse<Product>>(`/products/${id}`, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['products'] }); notify('Product updated successfully.'); }, onError: fail }); }
export function useSetProductStatus() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => apiClient.patch<ApiResponse<Product>>(`/products/${id}/status`, { status }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); notify('Product status updated.'); }, onError: fail }); }
export function useSetProductQuantity() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, quantity, notes }: { id: number; quantity: number; notes?: string }) => apiClient.patch<ApiResponse<Product>>(`/products/${id}/quantity`, { quantity, notes }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['inventory-history'] }); notify('Inventory adjusted.'); }, onError: fail }); }
export function useDeleteProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => apiClient.delete('/products/' + id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); notify('Product deleted.'); }, onError: fail }); }
export function useAdminProductImages(productId: number | undefined) { return useQuery({ queryKey: ['admin-product-images', productId], enabled: productId !== undefined, queryFn: async () => (await apiClient.get<ApiResponse<ProductImage[]>>(`/products/${productId}/images`)).data }); }
export function useUploadProductImage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ productId, file }: { productId: number; file: File }) => { const body = new FormData(); body.append('file', file); return apiClient.post<ApiResponse<ProductImage>>(`/products/${productId}/images`, body); }, onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['admin-product-images', variables.productId] }); notify('Product image uploaded.'); }, onError: fail }); }
export function useUpdateProductImage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ productId, imageId, isPrimary, sortOrder }: { productId: number; imageId: number; isPrimary?: boolean; sortOrder?: number }) => apiClient.patch<ApiResponse<ProductImage>>(`/products/${productId}/images/${imageId}`, { ...(isPrimary === undefined ? {} : { isPrimary }), ...(sortOrder === undefined ? {} : { sortOrder }) }), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['admin-product-images', variables.productId] }); notify('Product image updated.'); }, onError: fail }); }
export function useDeleteProductImage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) => apiClient.delete(`/products/${productId}/images/${imageId}`), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['admin-product-images', variables.productId] }); notify('Product image deleted.'); }, onError: fail }); }

export function useAdminCategories(params: { page?: number; perPage?: number; q?: string } = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['admin-categories', query], queryFn: async () => (await apiClient.get<PaginatedResponse<Category>>('/categories', { params: query })).data });
}
export function useCreateCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: { name: string; description?: string | null }) => apiClient.post<ApiResponse<Category>>('/categories', body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); notify('Category created successfully.'); }, onError: fail }); }
export function useUpdateCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...body }: { id: number; name?: string; description?: string | null }) => apiClient.put<ApiResponse<Category>>(`/categories/${id}`, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); notify('Category updated.'); }, onError: fail }); }
export function useDeleteCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => apiClient.delete(`/categories/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); notify('Category deleted.'); }, onError: fail }); }
export function useUploadCategoryImage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ categoryId, file }: { categoryId: number; file: File }) => { const body = new FormData(); body.append('file', file); return apiClient.post<ApiResponse<Category>>(`/categories/${categoryId}/image`, body); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); notify('Category image uploaded.'); }, onError: fail }); }
export function useDeleteCategoryImage() { const qc = useQueryClient(); return useMutation({ mutationFn: (categoryId: number) => apiClient.delete(`/categories/${categoryId}/image`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); notify('Category image deleted.'); }, onError: fail }); }

export function useInventoryHistory(params: { page?: number; perPage?: number; productId?: number; reason?: InventoryHistory['reason'] } = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['inventory-history', query], queryFn: async () => (await apiClient.get<PaginatedResponse<InventoryHistory>>('/inventory-histories', { params: query })).data });
}
export function useAdminOrders(params: { page?: number; perPage?: number; orderStatus?: Order['orderStatus']; paymentStatus?: Order['paymentStatus'] } = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['admin-orders', query], queryFn: async () => (await apiClient.get<PaginatedResponse<Order>>('/orders', { params: query })).data });
}
export function useUpdateOrderStatus() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: number; status: Order['orderStatus'] }) => apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); notify('Order status updated.'); }, onError: fail }); }
export function useMarkOrderRefunded() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/refunded`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); notify('Refund confirmed.'); }, onError: fail }); }

export function useAdminUsers(params: { page?: number; perPage?: number; q?: string; role?: 'admin' | 'customer'; status?: 'active' | 'locked' } = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['admin-users', query], queryFn: async () => (await apiClient.get<PaginatedResponse<User>>('/users', { params: query })).data });
}
export function useCreateUser() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: { fullName: string; email: string; password: string; phone?: string; role?: 'admin' | 'customer'; status?: 'active' | 'locked' }) => apiClient.post<ApiResponse<User>>('/users', body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); notify('User created successfully.'); }, onError: fail }); }
export function useUpdateUser() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...body }: { id: number; fullName?: string; password?: string; phone?: string; role?: 'admin' | 'customer'; status?: 'active' | 'locked' }) => apiClient.put<ApiResponse<User>>(`/users/${id}`, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); notify('User updated.'); }, onError: fail }); }
export function useDeleteUser() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => apiClient.delete(`/users/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); notify('User deleted.'); }, onError: fail }); }

export function useAdminUserDetail(id: number | undefined) {
  return useQuery({
    queryKey: ['admin-user-detail', id],
    enabled: id !== undefined,
    queryFn: async () => (await apiClient.get<ApiResponse<User>>(`/users/${id}`)).data.data,
  });
}

export function useRefundQueue(params: RefundsQuery = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({
    queryKey: ['admin-refunds', query],
    queryFn: async () => (await apiClient.get<PaginatedResponse<RefundItem>>('/payments/refunds', { params: query })).data,
  });
}

export function useProcessPaymentRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => apiClient.post<ApiResponse<RefundItem>>(`/payments/${paymentId}/refunded`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-refunds'] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      notify('Payment refund payout marked as completed.');
    },
    onError: fail,
  });
}
