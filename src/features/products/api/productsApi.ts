import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ApiResponse, ProductImage } from '@/types/api';

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85';

export function getPrimaryImage(images: ProductImage[]): string {
  if (images.length === 0) return DEFAULT_PRODUCT_IMAGE;
  return images.find((image) => image.isPrimary)?.url
    ?? images.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url
    ?? images[0].url;
}

function invalidateProductImageQueries(queryClient: ReturnType<typeof useQueryClient>, id: number) {
  queryClient.invalidateQueries({ queryKey: ['product', id] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<ApiResponse<ProductImage>>(`/products/${id}/images`, formData);
    },
    onSuccess: (_, variables) => invalidateProductImageQueries(queryClient, variables.id),
  });
}

export function useUpdateProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId, isPrimary, sortOrder }: { id: number; imageId: number; isPrimary?: boolean; sortOrder?: number }) => apiClient.patch<ApiResponse<ProductImage>>(`/products/${id}/images/${imageId}`, { ...(isPrimary === undefined ? {} : { isPrimary }), ...(sortOrder === undefined ? {} : { sortOrder }) }),
    onSuccess: (_, variables) => invalidateProductImageQueries(queryClient, variables.id),
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) => apiClient.delete(`/products/${id}/images/${imageId}`),
    onSuccess: (_, variables) => invalidateProductImageQueries(queryClient, variables.id),
  });
}
