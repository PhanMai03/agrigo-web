import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ApiResponse, Category, PaginatedResponse, Product } from '@/types/api';

export interface CategoriesQuery { page?: number; perPage?: number; q?: string }
export interface ProductsQuery { page?: number; perPage?: number; q?: string; categoryId?: number; status?: 'active' | 'inactive'; minPrice?: number; maxPrice?: number; sort?: 'newest' | 'price_asc' | 'price_desc' | 'name' }

export function useCategories(params: CategoriesQuery = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['categories', query], queryFn: async () => (await apiClient.get<PaginatedResponse<Category>>('/categories', { params: query })).data });
}

export function useProducts(params: ProductsQuery = {}) {
  const query = { page: 1, perPage: 15, ...params };
  return useQuery({ queryKey: ['products', query], queryFn: async () => (await apiClient.get<PaginatedResponse<Product>>('/products', { params: query })).data });
}

export function useProductDetail(id: number | undefined) {
  return useQuery({ queryKey: ['product', id], enabled: id !== undefined, queryFn: async () => (await apiClient.get<ApiResponse<Product>>(`/products/${id}`)).data.data });
}

export { useProductCatalog, fetchProductCatalog } from './catalogApi';
export type { ProductItem, ProductListResponse, ProductQueryParams } from '../types/catalog';
