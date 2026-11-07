import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { useProductDetail } from '@/features/products/api/hooks';
import { useAddToCart } from '@/features/cart/api/hooks';
import { useBuyNow } from '@/features/orders/api/hooks';
import { getPrimaryImage } from '@/features/products/api/productsApi';
import { ProductReviewsSection } from '@/features/reviews/components/ProductReviewsSection';
import { useProductReviewSummary } from '@/features/reviews/hooks/useReviews';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

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

  if (product.isLoading) {
    return (
      <MainLayout>
        <p className="w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center text-slate-500 font-semibold">
          Loading the harvest…
        </p>
      </MainLayout>
    );
  }

  if (!product.data) {
    return (
      <MainLayout>
        <p className="w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center text-rose-600 font-semibold">
          Product not found.
        </p>
      </MainLayout>
    );
  }

  const item = product.data;
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

        {/* Customer Reviews Section */}
        <ProductReviewsSection productId={item.id} />
      </section>
    </MainLayout>
  );
}
