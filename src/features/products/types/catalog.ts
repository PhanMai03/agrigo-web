// Request Params Model
export interface ProductQueryParams {
  pageIndex: number;
  pageSize: number;
  searchKeyword?: string;
  categoryId?: string | number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  isAvailable?: boolean;
}

// Response Model
export interface ProductItem {
  id: string | number;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName?: string;
  rating?: number;
  soldCount?: number;
  isAvailable: boolean;
}

export interface ProductListResponse {
  items: ProductItem[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

