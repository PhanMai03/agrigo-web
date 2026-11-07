import { motion } from 'framer-motion';
import { Leaf, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPrimaryImage } from '@/features/products/api/productsApi';
import type { ProductImage } from '@/types/api';

export type Product = {
  id: string | number;
  name: string;
  category?: string;
  image?: string;
  images?: ProductImage[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  unit?: string;
  rating?: number | null;
  averageRating?: number | null;
  reviewCount?: number;
  soldCount?: number;
  isOrganic?: boolean;
  badge?: string;
};

export type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const displayPrice = product.price;

  // Discount & Original price from API
  const discountPercent =
    typeof product.discountPercent === 'number' && product.discountPercent > 0
      ? product.discountPercent
      : undefined;

  const originalPrice =
    typeof product.originalPrice === 'number' && product.originalPrice > displayPrice
      ? product.originalPrice
      : discountPercent
      ? Math.round(displayPrice / (1 - discountPercent / 100))
      : undefined;

  // Real rating from API (backend returns averageRating)
  const rawRating = product.averageRating ?? product.rating;
  const rating =
    typeof rawRating === 'number' && Number.isFinite(rawRating) ? rawRating : 0;
  const reviewCount =
    typeof product.reviewCount === 'number' && Number.isFinite(product.reviewCount)
      ? product.reviewCount
      : 0;
  const roundedRating = Math.round(rating);
  const showBadge = Boolean(product.badge || product.isOrganic || discountPercent);

  return (
    <motion.article
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/10"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Product Image Frame */}
      <Link
        className="relative block aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-emerald-50/40"
        to={`/products/${product.id}`}
      >
        <img
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          src={product.image ?? getPrimaryImage(product.images ?? [])}
        />

        {/* Badges: Discount or Organic */}
        {discountPercent ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
            -{discountPercent}%
          </span>
        ) : showBadge ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-900/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100 shadow-sm backdrop-blur-md">
            <Leaf size={12} className="text-emerald-400" />
            {product.badge ?? 'Organic'}
          </span>
        ) : null}
      </Link>

      {/* Product Meta Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {product.category && (
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
              {product.category}
            </p>
          )}

          <Link
            className="mt-1 block truncate text-base sm:text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700"
            to={`/products/${product.id}`}
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Star Rating & Review Count (Actual backend averageRating) */}
          <div
            className="mt-2 flex items-center justify-between"
            title={rating > 0 ? `${rating.toFixed(1)}/5 stars` : 'No reviews yet'}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      rating > 0 && i < roundedRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-400">
                ({reviewCount > 0 ? reviewCount : rating > 0 ? rating.toFixed(1) : 0})
              </span>
            </div>

            {typeof product.soldCount === 'number' && product.soldCount > 0 && (
              <span className="text-[11px] text-slate-400">
                Sold {product.soldCount}
              </span>
            )}
          </div>

          {/* Price & Original Price */}
          <div className="mt-2.5 min-h-[46px]">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#4D0E13]">
                {currency.format(displayPrice)}
              </span>
              {product.unit && (
                <span className="text-xs font-medium text-slate-400">
                  /{product.unit}
                </span>
              )}
            </div>
            {originalPrice ? (
              <div className="mt-0.5 text-xs font-semibold text-slate-400 line-through">
                {currency.format(originalPrice)}
              </div>
            ) : (
              <div className="mt-0.5 text-xs font-semibold text-transparent select-none">
                -
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 py-2.5 px-4 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-800 shadow-sm hover:shadow-md hover:shadow-emerald-900/15 active:scale-[0.98]"
          onClick={() => onAddToCart?.(product)}
          type="button"
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </motion.button>
      </div>
    </motion.article>
  );
}
