import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ApiResponse, Category, PaginatedResponse, Product } from '@/types/api';

export interface CategoriesQuery { page?: number; perPage?: number; q?: string }
export interface ProductsQuery { page?: number; perPage?: number; q?: string; categoryId?: number; status?: 'active' | 'inactive'; minPrice?: number; maxPrice?: number; sort?: 'newest' | 'price_asc' | 'price_desc' | 'name' }

export function useCategories(params: CategoriesQuery = {}) {
  return useQuery({ queryKey: ['categories', params], queryFn: async () => (await apiClient.get<PaginatedResponse<Category>>('/categories', { params })).data });
}

export function useProducts(params: ProductsQuery = {}) {
  return useQuery({ queryKey: ['products', params], queryFn: async () => (await apiClient.get<PaginatedResponse<Product>>('/products', { params })).data });
}

export function useProductDetail(id: number | undefined) {
  return useQuery({ queryKey: ['product', id], enabled: id !== undefined, queryFn: async () => (await apiClient.get<ApiResponse<Product>>(`/products/${id}`)).data.data });
}

export { useProductCatalog, fetchProductCatalog } from './catalogApi';
export type { ProductItem, ProductListResponse, ProductQueryParams } from '../types/catalog';
