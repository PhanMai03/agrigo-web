import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Home,
  Layers,
  RefreshCw,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProductCard } from '@/components/ProductCard';
import { useAddToCart } from '@/features/cart/api/hooks';
import { useCategories, useProducts } from '@/features/products/api/hooks';
import { useToastStore } from '@/stores/toastStore';
import { productImage } from '@/lib/images';
import type { Product } from '@/types/api';

const MAX_PRICE_LIMIT = 1000000; // 1.000.000₫
const PAGE_SIZE = 12; // 3 rows x 4 columns standard

export function AllProductsPage() {
  const [params, setParams] = useSearchParams();

  // Active Dropdown state for Horizontal Filters ('price' | 'rating' | null)
  const [activeDropdown, setActiveDropdown] = useState<'price' | 'rating' | null>(null);

  // Category Carousel Slider scroll ref & state
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 1. Read URL Search Parameters (Sync with URL for bookmarking & sharing)
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const categoryId = params.get('categoryId') ? Number(params.get('categoryId')) : undefined;
  const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : undefined;
  const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined;
  const sort = (params.get('sort') as 'newest' | 'price_asc' | 'price_desc' | 'name' | null) ?? 'newest';
  const isAvailableOnly = params.get('available') === 'true';
  const ratingFilter = params.get('rating') ? Number(params.get('rating')) : undefined;
  const urlSearch = params.get('q') ?? '';

  // 2. Price Range Slider Local State
  const [sliderPrice, setSliderPrice] = useState<number>(maxPrice ?? MAX_PRICE_LIMIT);
  useEffect(() => {
    setSliderPrice(maxPrice ?? MAX_PRICE_LIMIT);
  }, [maxPrice]);

  // 3. API Queries via TanStack Query (100% Real API, No hardcoding)
  // Categories list from API
  const categoriesQuery = useCategories({ page: 1, perPage: 100 });
  const categories = categoriesQuery.data?.data ?? [];

  // All products query to calculate exact, real product counts per category
  const allProductsQuery = useProducts({ page: 1, perPage: 100 });
  const allProductsList = allProductsQuery.data?.data ?? [];

  // Compute exact real category counts directly from API data
  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    allProductsList.forEach((p) => {
      const catId = p.category?.id;
      if (catId) {
        counts[catId] = (counts[catId] ?? 0) + 1;
      }
    });
    return counts;
  }, [allProductsList]);

  // Total products count across the catalog from API
  const totalAllCatalogCount = allProductsList.length || (allProductsQuery.data?.meta?.total ?? 0);

  // Carousel scroll checker for when categories overflow
  const checkScroll = () => {
    if (!categoriesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoriesScrollRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    categoriesScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  // Filtered & Paginated products query from API
  const productsQuery = useProducts({
    page,
    perPage: PAGE_SIZE,
    q: urlSearch || undefined,
    categoryId,
    minPrice,
    maxPrice,
    sort,
  });

  const rawProducts = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  // Add to Cart Mutation
  const addCart = useAddToCart();

  // Helper function to update search params and reset page to 1
  const updateParam = (key: string, value?: string | number | boolean) => {
    const next = new URLSearchParams(params);
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      next.set(key, String(value));
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setParams(next);
  };

  const clearAllFilters = () => {
    setSliderPrice(MAX_PRICE_LIMIT);
    setActiveDropdown(null);
    setParams({});
  };

  // Client-side availability & rating filters if requested
  const displayedProducts: Product[] = useMemo(() => {
    let list = rawProducts;

    // Filter by availability (stock > 0 or status active)
    if (isAvailableOnly) {
      list = list.filter((p) => p.status === 'active' && (p.quantity === undefined || p.quantity > 0));
    }

    // Filter by rating if set
    if (ratingFilter) {
      list = list.filter((p) => {
        const r = (p as any).rating;
        return typeof r === 'number' && r >= ratingFilter;
      });
    }

    return list;
  }, [rawProducts, isAvailableOnly, ratingFilter]);

  const totalProducts = meta?.total ?? displayedProducts.length;
  const totalPages = Math.max(1, meta?.totalPages ?? Math.ceil(totalProducts / PAGE_SIZE) ?? 1);

  // Active Category Name
  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    urlSearch ||
      categoryId !== undefined ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      isAvailableOnly ||
      ratingFilter !== undefined
  );

  // Pagination generator: < 1 2 3 ... 11 >
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }, [page, totalPages]);

  const handlePageChange = (newPage: number) => {
    updateParam('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addCart.mutate(
      { productId: Number(product.id), quantity: 1 },
      {
        onSuccess: () => {
          useToastStore.getState().push({
            type: 'success',
            message: `Added "${product.name}" to cart`,
          });
        },
      }
    );
  };

  // Quick price presets
  const pricePresets = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: '< 50k', min: undefined, max: 50000 },
    { label: '50k - 100k', min: 50000, max: 100000 },
    { label: '100k - 300k', min: 100000, max: 300000 },
    { label: '> 300k', min: 300000, max: undefined },
  ];

  return (
    <MainLayout>
      {/* Synchronized container matching Header, Footer & Global standard */}
      <div id="products" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* =========================================================
            BREADCRUMBS
            ========================================================= */}
        <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-emerald-700 transition">
            <Home size={14} />
            <span>Home</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-emerald-950">All Products</span>
          {selectedCategory && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-emerald-700">{selectedCategory.name}</span>
            </>
          )}
        </nav>

        {/* =========================================================
            PAGE HEADER
            ========================================================= */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {selectedCategory ? selectedCategory.name : 'All Fresh Produce'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            100% organic VietGAP &amp; GlobalGAP produce, harvested at dawn &amp; delivered fresh in 2 hours.
          </p>
        </div>

        {/* =========================================================
            1. CATEGORIES CIRCLE CAROUSEL
            ========================================================= */}
        <div className="relative mb-6 group/carousel">
          {/* Left Scroll Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-700 shadow-md hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-900 hover:scale-105 active:scale-95 transition-all"
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none hidden sm:block" />
          )}

          {/* Scroll Track */}
          <div
            ref={categoriesScrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-4 sm:gap-7 overflow-x-auto py-2 px-2 no-scrollbar scroll-smooth"
          >
            {/* Circle 1: All */}
            <button
              type="button"
              onClick={() => updateParam('categoryId', undefined)}
              className="group flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <div
                className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full transition-all duration-300 ${
                  categoryId === undefined
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-600/25 shadow-lg scale-105'
                    : 'bg-emerald-50 text-emerald-800 border-2 border-slate-200/80 hover:border-emerald-500 hover:scale-105 hover:shadow-md'
                }`}
              >
                <Layers size={26} className={categoryId === undefined ? 'text-white' : 'text-emerald-700'} />
              </div>
              <div className="text-center">
                <span
                  className={`block text-xs sm:text-sm transition-colors ${
                    categoryId === undefined
                      ? 'font-black text-emerald-950'
                      : 'font-bold text-slate-700 group-hover:text-emerald-800'
                  }`}
                >
                  All
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {totalAllCatalogCount} items
                </span>
              </div>
            </button>

            {/* Circles: Category from API */}
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              const count = categoryCounts[c.id] ?? 0;
              const imgUrl = c.imageUrl ?? productImage(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateParam('categoryId', c.id)}
                  className="group flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-95"
                >
                  <div
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-emerald-600/30 border-2 border-emerald-700 scale-105 shadow-lg'
                        : 'border-2 border-slate-200 hover:border-emerald-500 hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="text-center">
                    <span
                      className={`block text-xs sm:text-sm transition-colors ${
                        isSelected
                          ? 'font-black text-emerald-950'
                          : 'font-bold text-slate-700 group-hover:text-emerald-800'
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {count} items
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none hidden sm:block" />
          )}

          {/* Right Scroll Arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-700 shadow-md hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-900 hover:scale-105 active:scale-95 transition-all"
              aria-label="Scroll categories right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* =========================================================
            2. FLAT TOOLBAR: PRICE, RATING, AVAILABILITY & SORT
            ========================================================= */}
        <div className="relative z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/80 py-3.5">
          
          {/* Filters left */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Price Filter Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'price' ? null : 'price')
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                  minPrice !== undefined || maxPrice !== undefined
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                <DollarSign size={13} className="text-emerald-700" />
                <span>
                  {maxPrice
                    ? `Price: ≤ ${maxPrice.toLocaleString('vi-VN')}₫`
                    : 'Price Range'}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform ${
                    activeDropdown === 'price' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Price Filter Dropdown Card */}
              {activeDropdown === 'price' && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActiveDropdown(null)}
                  />
                  <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                        Select Price Range
                      </h4>
                      <span className="text-xs font-bold text-emerald-700">
                        {sliderPrice < MAX_PRICE_LIMIT
                          ? `≤ ${sliderPrice.toLocaleString('vi-VN')}₫`
                          : 'All'}
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE_LIMIT}
                        step={10000}
                        value={sliderPrice}
                        onChange={(e) => setSliderPrice(Number(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-emerald-100 accent-emerald-700"
                      />
                      <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
                        <span>0₫</span>
                        <span>1,000,000₫</span>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {pricePresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const next = new URLSearchParams(params);
                            if (preset.min !== undefined) next.set('minPrice', String(preset.min));
                            else next.delete('minPrice');

                            if (preset.max !== undefined) {
                              next.set('maxPrice', String(preset.max));
                              setSliderPrice(preset.max);
                            } else {
                              next.delete('maxPrice');
                              setSliderPrice(MAX_PRICE_LIMIT);
                            }
                            next.set('page', '1');
                            setParams(next);
                            setActiveDropdown(null);
                          }}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateParam(
                          'maxPrice',
                          sliderPrice < MAX_PRICE_LIMIT ? sliderPrice : undefined
                        );
                        setActiveDropdown(null);
                      }}
                      className="mt-3.5 w-full rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Rating Filter Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                  ratingFilter
                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{ratingFilter ? `${ratingFilter}+ stars` : 'Rating'}</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform ${
                    activeDropdown === 'rating' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Rating Filter Dropdown Card */}
              {activeDropdown === 'rating' && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActiveDropdown(null)}
                  />
                  <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => {
                          updateParam('rating', ratingFilter === stars ? undefined : stars);
                          setActiveDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                          ratingFilter === stars
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-200 text-slate-200'
                                }
                              />
                            ))}
                          </div>
                          <span>{stars === 5 ? '5 stars' : `${stars}+ stars`}</span>
                        </div>
                        {ratingFilter === stars && <Check size={13} className="text-amber-700" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Availability Toggle */}
            <button
              type="button"
              onClick={() => updateParam('available', isAvailableOnly ? undefined : true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                isAvailableOnly
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                  isAvailableOnly
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isAvailableOnly && <Check size={10} strokeWidth={3} />}
              </div>
              <span>In stock only</span>
            </button>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100/80 transition"
                title="Clear all filters"
              >
                <RotateCcw size={12} />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Sort right */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs font-bold text-slate-500">Sort by:</label>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 shadow-2xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            3. ACTIVE FILTER CHIPS ROW
            ========================================================= */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Filtered by:</span>

            {urlSearch && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Keyword: &quot;{urlSearch}&quot;
                <button
                  type="button"
                  onClick={() => updateParam('q', undefined)}
                  className="hover:text-emerald-950"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Category: {selectedCategory.name}
                <button
                  type="button"
                  onClick={() => updateParam('categoryId', undefined)}
                  className="hover:text-emerald-950"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Price: {minPrice ? `${minPrice.toLocaleString('vi-VN')}₫` : '0₫'} -{' '}
                {maxPrice ? `${maxPrice.toLocaleString('vi-VN')}₫` : '1,000,000₫'}
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.delete('minPrice');
                    next.delete('maxPrice');
                    setSliderPrice(MAX_PRICE_LIMIT);
                    next.set('page', '1');
                    setParams(next);
                  }}
                  className="hover:text-emerald-950"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {isAvailableOnly && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                In stock only
                <button
                  type="button"
                  onClick={() => updateParam('available', undefined)}
                  className="hover:text-emerald-950"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {ratingFilter && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                From {ratingFilter} stars
                <button
                  type="button"
                  onClick={() => updateParam('rating', undefined)}
                  className="hover:text-amber-950"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* =========================================================
            4. PRODUCT GRID
            ========================================================= */}

        {/* SKELETON LOADER */}
        {productsQuery.isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-7">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm"
              >
                <div className="aspect-square w-full bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-10 w-full rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE WITH RETRY */}
        {!productsQuery.isLoading && productsQuery.isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle size={28} />
            </div>
            <h4 className="mt-4 text-lg font-extrabold text-rose-900">
              Failed to load products
            </h4>
            <p className="mt-1 text-xs text-rose-700">
              {(productsQuery.error as any)?.message || 'Please check that the backend API is running and try again.'}
            </p>
            <button
              type="button"
              onClick={() => productsQuery.refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-800 transition"
            >
              <RefreshCw size={14} />
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* EMPTY STATE WITH RESET */}
        {!productsQuery.isLoading && !productsQuery.isError && displayedProducts.length === 0 && (
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <Filter size={28} />
            </div>
            <h4 className="mt-4 text-lg font-extrabold text-emerald-950">
              No matching products found
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              Try widening your price range, choosing another category, or clearing search keywords.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              <RotateCcw size={14} />
              <span>View all products</span>
            </button>
          </div>
        )}

        {/* SUCCESS: 4-COLUMN PRODUCT GRID */}
        {!productsQuery.isLoading && !productsQuery.isError && displayedProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-7">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.category?.name,
                  price: product.price,
                  unit: product.unit,
                  images: product.images,
                  image: product.images?.[0]?.url,
                  discountPercent: product.discountPercent,
                  averageRating: product.averageRating,
                  soldCount: product.soldCount,
                }}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}

        {/* =========================================================
            PAGINATION CONTROLS
            ========================================================= */}
        {!productsQuery.isLoading && displayedProducts.length > 0 && (
          <div className="mt-14 mb-8 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-emerald-600 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {paginationItems.map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-10 w-8 items-center justify-center text-xs font-bold text-slate-400 select-none"
                  >
                    ...
                  </span>
                );
              }

              const p = item as number;
              const isActive = page === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3.5 text-xs font-bold transition-all shadow-2xs ${
                    isActive
                      ? 'bg-emerald-700 text-white font-extrabold shadow-sm ring-2 ring-emerald-700/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-emerald-600 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
