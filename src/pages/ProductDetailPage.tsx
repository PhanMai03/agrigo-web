import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { useProductDetail, useProducts } from '@/features/products/api/hooks';
import { useAddToCart } from '@/features/cart/api/hooks';
import { useBuyNow } from '@/features/orders/api/hooks';
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
  const buy = useBuyNow();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const item = product.data;

  // Query related products in the same category
  const relatedQuery = useProducts({
    categoryId: item?.category.id,
    perPage: 8,
    status: 'active',
  });

  const relatedProducts = (relatedQuery.data?.data ?? [])
    .filter((prod) => prod.id !== item?.id)
    .slice(0, 3);

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

  const buyNow = () =>
    buy.mutate(
      { productId: item.id, quantity, paymentMethod: 'cod' },
      { onSuccess: (result) => navigate(`/orders/${result.order.id}`) }
    );

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
                        className={`group relative h-20 sm:h-24 w-full overflow-hidden rounded-xl border-2 bg-[#ded8c9]/35 transition-all ${
                          isSelected
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

            <p className="mt-7 text-base leading-7 text-[#19342b]/65">
              {item.description ??
                'Freshly picked produce from certified local farms. Rich in nutrients and perfect for a healthy everyday table.'}
            </p>

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

            <div className="mt-7 flex gap-3">
              <button
                className="ink-button flex-1"
                onClick={() => add.mutate({ productId: item.id, quantity })}
                type="button"
              >
                <ShoppingCart size={17} /> Add to basket
              </button>
              <button
                className="border border-[#19342b] px-5 text-xs font-bold uppercase tracking-wider text-[#19342b] hover:bg-[#19342b] hover:text-[#f5f2ea]"
                onClick={buyNow}
                type="button"
                title="Buy now"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-7 flex items-center gap-3 text-xs text-[#19342b]/60">
              <ShieldCheck size={19} className="text-[#c46532]" /> Quality checked. Easy returns
              within 7 days.
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
                className={`relative pb-3.5 text-sm sm:text-base font-bold transition-all ${
                  activeTab === 'description'
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
                className={`relative pb-3.5 text-sm sm:text-base font-bold transition-all ${
                  activeTab === 'reviews'
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
                <div className="text-gray-600 space-y-4">
                  <p className="leading-relaxed text-sm">
                    {item.description ??
                      'Our agricultural products are carefully cultivated using organic farming methods without harmful chemicals or pesticides. Handpicked at peak ripeness to ensure the best taste and highest nutritional value.'}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 font-medium pt-2">
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      100% Organic &amp; Non-GMO verified
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      No chemical preservatives or synthetic additives
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Rich in essential vitamins, minerals &amp; dietary antioxidants
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Harvested fresh daily from certified organic farms in Vietnam
                    </li>
                  </ul>
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
              <Link
                to={`/products?categoryId=${item.category.id}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {relatedQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
                ))
              ) : relatedProducts.length === 0 ? (
                <p className="col-span-3 py-8 text-center text-xs text-gray-400">
                  No other items in {item.category.name}.
                </p>
              ) : (
                relatedProducts.map((relProduct) => (
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

        {/* Bottom Feature Badges Bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 rounded-3xl border border-emerald-950/10 bg-[#f9fbf9] p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Leaf size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">100% Organic</h4>
              <p className="text-xs text-gray-500">Naturally grown and chemical-free.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Fast Delivery</h4>
              <p className="text-xs text-gray-500">Quick delivery to your doorstep.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Secure Payment</h4>
              <p className="text-xs text-gray-500">Safe via COD and VNPay portal.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Headphones size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">24/7 Support</h4>
              <p className="text-xs text-gray-500">Always here to support you.</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
