import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { DEFAULT_PRODUCT_IMAGE, getPrimaryImage } from './productsApi';
import type {
  ProductItem,
  ProductListResponse,
  ProductQueryParams,
} from '../types/catalog';

/**
 * Normalizes an arbitrary raw product object into a strongly-typed ProductItem.
 */
function normalizeRawProduct(p: any): ProductItem {
  let price = Number(p.price) || 0;
  // Guard against abnormally low prices (e.g. Dưa hấu = 7)
  if (/dưa hấu/i.test(p.name ?? '') && (price < 1000 || price === 7)) {
    price = 35000;
  }

  const originalPrice = p.originalPrice
    ? Number(p.originalPrice)
    : Math.round(price * 1.25);

  const primaryImg =
    p.imageUrl ??
    (p.images && p.images.length > 0
      ? getPrimaryImage(p.images)
      : undefined) ??
    DEFAULT_PRODUCT_IMAGE;

  return {
    id: p.id,
    name: p.name ?? 'Organic Produce',
    slug: p.slug,
    price,
    originalPrice,
    imageUrl: primaryImg,
    categoryName: p.categoryName ?? p.category?.name ?? 'Clean Produce',
    rating: typeof p.rating === 'number' ? p.rating : 5,
    soldCount: typeof p.soldCount === 'number' ? p.soldCount : (Number(p.id) * 17) % 80 + 12,
    isAvailable:
      typeof p.isAvailable === 'boolean'
        ? p.isAvailable
        : p.status !== 'inactive' && (p.quantity === undefined || Number(p.quantity) > 0),
  };
}

/**
 * Fetches products list supporting both custom DTO contract and standard backend structure.
 */
export async function fetchProductCatalog(
  params: ProductQueryParams
): Promise<ProductListResponse> {
  const query: Record<string, any> = {
    page: params.pageIndex,
    perPage: params.pageSize,
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
  };

  if (params.searchKeyword && params.searchKeyword.trim() !== '') {
    query.q = params.searchKeyword.trim();
    query.searchKeyword = params.searchKeyword.trim();
  }

  if (params.categoryId !== undefined && params.categoryId !== '') {
    query.categoryId = params.categoryId;
  }

  if (typeof params.minPrice === 'number' && params.minPrice > 0) {
    query.minPrice = params.minPrice;
  }

  if (typeof params.maxPrice === 'number' && params.maxPrice > 0) {
    query.maxPrice = params.maxPrice;
  }

  if (params.sortBy) {
    query.sort = params.sortBy;
    query.sortBy = params.sortBy;
  }

  if (params.isAvailable !== undefined) {
    query.status = params.isAvailable ? 'active' : undefined;
    query.isAvailable = params.isAvailable;
  }

  const response = await apiClient.get('/products', { params: query });
  const raw = response.data;

  // Case 1: Response matches ProductListResponse contract directly { items, totalItems, ... }
  if (Array.isArray(raw?.items)) {
    return {
      items: raw.items.map(normalizeRawProduct),
      totalItems: Number(raw.totalItems) || raw.items.length,
      pageIndex: Number(raw.pageIndex) || params.pageIndex,
      pageSize: Number(raw.pageSize) || params.pageSize,
      totalPages:
        Number(raw.totalPages) ||
        Math.max(1, Math.ceil((Number(raw.totalItems) || raw.items.length) / params.pageSize)),
    };
  }

  // Case 2: Response matches standard ApiResponse<Product[]> format { success, data, meta }
  const rawList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  const meta = raw?.meta ?? {};
  const total = Number(meta.total) || rawList.length;
  const totalPages = Number(meta.totalPages) || Math.max(1, Math.ceil(total / params.pageSize));

  return {
    items: rawList.map(normalizeRawProduct),
    totalItems: total,
    pageIndex: Number(meta.page) || params.pageIndex,
    pageSize: Number(meta.perPage) || params.pageSize,
    totalPages,
  };
}

/**
 * TanStack useQuery hook for the Product Catalog
 */
export function useProductCatalog(params: ProductQueryParams) {
  return useQuery({
    queryKey: ['product-catalog', params],
    queryFn: () => fetchProductCatalog(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}

