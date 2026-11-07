import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { useProductDetail, useProducts } from '@/features/products/api/hooks';
import { useAddToCart } from '@/features/cart/api/hooks';
import { getPrimaryImage } from '@/features/products/api/productsApi';
import { ProductReviewsSection } from '@/features/reviews/components/ProductReviewsSection';
import { useProductReviewSummary } from '@/features/reviews/hooks/useReviews';
import { productImage } from '@/lib/images';
import type { Product } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function RelatedProductMiniCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  const imageUrl = getPrimaryImage(product.images) || productImage(product.id);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-2xs transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-gray-50"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            (event.target as HTMLImageElement).src = productImage(product.id);
          }}
        />
      </Link>

      <div className="mt-2 flex flex-1 flex-col justify-between">
        <Link
          to={`/products/${product.id}`}
          className="line-clamp-1 text-xs font-bold text-gray-900 hover:text-emerald-700 transition"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* 5-star mini indicator */}
        <div className="mt-1 flex items-center text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={10} className="fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-black text-[#4D0E13]">
            {currency.format(product.price)}
          </span>

          <button
            onClick={onAddToCart}
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 transition hover:bg-emerald-700 hover:text-white"
            title="Add to cart"
          >
            <ShoppingCart size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const product = useProductDetail(Number.isFinite(id) ? id : undefined);
  const reviewSummary = useProductReviewSummary(Number.isFinite(id) ? id : undefined);
  const add = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [relatedPage, setRelatedPage] = useState(0);

  const item = product.data;

  // Query related products in the same category
  const relatedQuery = useProducts({
    categoryId: item?.category.id,
    perPage: 12,
    status: 'active',
  });

  const relatedList = (relatedQuery.data?.data ?? []).filter((prod) => prod.id !== item?.id);
  const totalRelatedPages = Math.max(1, Math.ceil(relatedList.length / 3));
  const currentRelatedPage = Math.min(relatedPage, totalRelatedPages - 1);
  const visibleRelated = relatedList.slice(currentRelatedPage * 3, currentRelatedPage * 3 + 3);

  if (product.isLoading) {
    return (
      <MainLayout>
        <p className="w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center text-slate-500 font-semibold">
          Loading the harvest…
        </p>
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <p className="w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center text-rose-600 font-semibold">
          Product not found.
        </p>
      </MainLayout>
    );
  }

  const images = item.images ?? [];
  const selectedImage = images.find((image) => image.id === selectedImageId);
  const image = selectedImage?.url ?? getPrimaryImage(images);
  const activeImageId =
    selectedImage?.id ?? images.find((candidate) => candidate.isPrimary)?.id ?? images[0]?.id;

  const buyNow = () => {
    add.mutate(
      { productId: item.id, quantity },
      {
        onSuccess: () => navigate('/checkout'),
      }
    );
  };

  // Sub-images (Thumbnail) Controls: Show 4 visible images, with arrow buttons only when > 4
  const VISIBLE_COUNT = 4;
  const hasMoreThanFour = images.length > VISIBLE_COUNT;
  const maxStartIndex = Math.max(0, images.length - VISIBLE_COUNT);

  const visibleImages = hasMoreThanFour
    ? images.slice(thumbStartIndex, thumbStartIndex + VISIBLE_COUNT)
    : images.slice(0, VISIBLE_COUNT);

  const handlePrev = () => {
    setThumbStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setThumbStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  return (
    <MainLayout>
      <section className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <Link className="editorial-link text-xs uppercase tracking-widest" to="/products">
          <ArrowLeft size={15} /> Back to harvest
        </Link>

        {/* Product Hero Showcase */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            {/* Main Featured Product Image */}
            <div className="relative h-[55vh] min-h-[420px] overflow-hidden rounded-2xl bg-[#ded8c9]">
              <img alt={item.name} className="h-full w-full object-cover" src={image} />
              <span className="absolute bottom-6 left-6 bg-[#f5f2ea] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#19342b]">
                Field note / {item.category.name}
              </span>
            </div>

            {/* Sub-Images (Thumbnails) Section - Spans Full Frame Width */}
            {images.length > 0 && (
              <div className="mt-4 flex items-center gap-2 sm:gap-2.5 w-full">
                {/* Left Arrow Button (ONLY if > 4 images) */}
                {hasMoreThanFour && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={thumbStartIndex === 0}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                    aria-label="Previous thumbnails"
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                {/* 4 Thumbnails filling the entire frame width */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3 flex-1 w-full">
                  {visibleImages.map((thumbnail) => {
                    const isSelected = thumbnail.id === activeImageId;
                    return (
                      <button
                        key={thumbnail.id}
                        type="button"
                        onClick={() => setSelectedImageId(thumbnail.id)}
                        className={`group relative h-20 sm:h-24 w-full overflow-hidden rounded-xl border-2 bg-[#ded8c9]/35 transition-all ${isSelected
                            ? 'border-emerald-700 ring-2 ring-emerald-700/25 shadow-sm'
                            : 'border-slate-200/80 opacity-80 hover:opacity-100 hover:border-slate-400'
                          }`}
                        aria-label={`View image ${thumbnail.id}`}
                      >
                        <img
                          src={thumbnail.url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Right Arrow Button (ONLY if > 4 images) */}
                {hasMoreThanFour && (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={thumbStartIndex >= maxStartIndex}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                    aria-label="Next thumbnails"
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Details Column */}
          <div className="max-w-lg">
            <p className="eyebrow">{item.category.name}</p>
            <h1 className="display mt-5 text-6xl leading-[.9] text-[#19342b] sm:text-8xl">
              {item.name}
            </h1>

            {/* Real Review Rating Summary */}
            <div className="mt-3.5 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={
                      star <= Math.round(reviewSummary.data?.average ?? 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {reviewSummary.data?.average ? reviewSummary.data.average.toFixed(1) : 'No ratings yet'}
              </span>
              <span className="text-xs text-slate-400">
                ({reviewSummary.data?.count ?? 0} reviews)
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#4D0E13]">
                {currency.format(item.price)}
              </span>
              <span className="text-sm text-[#19342b]/50">/ {item.unit}</span>
            </div>

            {item.description && (
              <p className="mt-7 text-base leading-7 text-[#19342b]/70 whitespace-pre-line">
                {item.description}
              </p>
            )}

            <div className="mt-8 border-y border-[#19342b]/20 py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#19342b]/55">Available today</span>
                <strong>
                  {item.quantity} {item.unit}
                </strong>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[#19342b]/55">Quantity</span>
                <div className="ml-auto flex items-center border border-[#19342b]/25">
                  <button
                    className="p-3"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    className="p-3"
                    onClick={() => setQuantity((value) => Math.min(item.quantity, value + 1))}
                    type="button"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                className="ink-button flex-1"
                onClick={() => add.mutate({ productId: item.id, quantity })}
                type="button"
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-emerald-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 hover:-translate-y-0.5 active:translate-y-0"
                onClick={buyNow}
                type="button"
              >
                <Zap size={16} className="fill-emerald-950" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Section: Description & Reviews Tabs (Left) + You May Also Like (Right) */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* Left Column: Description & Reviews Tabs */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100 gap-8">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`relative pb-3.5 text-sm sm:text-base font-bold transition-all ${activeTab === 'description'
                    ? 'text-emerald-800'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Description
                {activeTab === 'description' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-700" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`relative pb-3.5 text-sm sm:text-base font-bold transition-all ${activeTab === 'reviews'
                    ? 'text-emerald-800'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Reviews ({reviewSummary.data?.count ?? 0})
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-700" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
              {activeTab === 'description' ? (
                <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
                  {item.description ? (
                    <p className="whitespace-pre-line">{item.description}</p>
                  ) : (
                    <p className="italic text-slate-400">No description provided for this product.</p>
                  )}
                  <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400">Category: </span>
                      <span className="font-semibold text-slate-800">{item.category.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Unit: </span>
                      <span className="font-semibold text-slate-800">{item.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Available Stock: </span>
                      <span className="font-semibold text-slate-800">{item.quantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status: </span>
                      <span className="font-semibold capitalize text-emerald-700">
                        {item.status === 'active' ? 'In Stock' : item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <ProductReviewsSection productId={item.id} />
              )}
            </div>
          </div>

          {/* Right Column: You May Also Like Card */}
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">You May Also Like</h3>
                <p className="text-[11px] text-gray-400">Same category recommendations</p>
              </div>
              <div className="flex items-center gap-2">
                {relatedList.length > 3 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentRelatedPage <= 0}
                      onClick={() => setRelatedPage((prev) => Math.max(0, prev - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Previous related products"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={currentRelatedPage >= totalRelatedPages - 1}
                      onClick={() => setRelatedPage((prev) => Math.min(totalRelatedPages - 1, prev + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Next related products"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                <Link
                  to={`/products?categoryId=${item.category.id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                >
                  View All
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {relatedQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
                ))
              ) : visibleRelated.length === 0 ? (
                <p className="col-span-3 py-8 text-center text-xs text-gray-400">
                  No other items in {item.category.name}.
                </p>
              ) : (
                visibleRelated.map((relProduct) => (
                  <RelatedProductMiniCard
                    key={relProduct.id}
                    product={relProduct}
                    onAddToCart={() => add.mutate({ productId: relProduct.id, quantity: 1 })}
                  />
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
}
