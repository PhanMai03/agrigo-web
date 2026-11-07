import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { MainLayout } from '@/layouts/MainLayout';
import { Hero3DSection } from '@/components/Hero3DSection';
import { useAddToCart } from '@/features/cart/api/hooks';
import { useCategories, useProducts } from '@/features/products/api/hooks';
import { productImage } from '@/lib/images';

export function HomePage() {
  const [categoryPage, setCategoryPage] = useState(0);
  const [productPage, setProductPage] = useState(0);
  const categories = useCategories({ page: 1, perPage: 50 });
  const products = useProducts({ page: 1, perPage: 25, sort: 'newest' });
  const add = useAddToCart();

  const categoryList = categories.data?.data ?? [];
  const totalCategoryPages = Math.max(1, Math.ceil(categoryList.length / 4));
  const currentCategoryPage = Math.min(categoryPage, totalCategoryPages - 1);
  const visibleCategories = categoryList.slice(
    currentCategoryPage * 4,
    currentCategoryPage * 4 + 4
  );

  const productList = products.data?.data ?? [];
  const totalProductPages = Math.max(1, Math.ceil(productList.length / 5));
  const currentProductPage = Math.min(productPage, totalProductPages - 1);
  const visibleProducts = productList.slice(
    currentProductPage * 5,
    currentProductPage * 5 + 5
  );

  return (
    <MainLayout>
      <Hero3DSection />

      {/* Fresh Categories Section: Lưới 4 card danh mục dàn đều trải rộng theo container */}
      <section id="about" className="bg-white">
        <Reveal className="w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/15 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <Leaf size={13} /> Explore Farm Produce
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                Featured Categories
              </h2>
            </div>
            <div className="flex items-center gap-3.5">
              {categoryList.length > 4 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentCategoryPage <= 0}
                    onClick={() => setCategoryPage((prev) => Math.max(0, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Previous categories"
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={currentCategoryPage >= totalCategoryPages - 1}
                    onClick={() => setCategoryPage((prev) => Math.min(totalCategoryPages - 1, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next categories"
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              <Link
                className="group inline-flex items-center gap-1 text-sm font-bold text-emerald-900 transition-colors hover:text-emerald-600"
                to="/products"
              >
                <span>View all</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {(visibleCategories.length > 0 ? visibleCategories : categoryList.slice(0, 4)).map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full"
              >
                <Link
                  className="group block overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm transition hover:shadow-xl hover:shadow-emerald-950/10 hover:border-emerald-500/40"
                  to={`/products?categoryId=${category.id}`}
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-emerald-50/50">
                    <img
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      src={category.imageUrl ?? productImage(category.id)}
                    />

                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="font-extrabold text-emerald-950 text-base sm:text-lg group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Featured Fresh Products Section */}
      <section id="products" className="border-t border-emerald-950/5 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 py-16">
        <Reveal className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/15 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <Leaf size={13} /> Handpicked Fresh Produce
              </span>
              <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                Featured Products
              </h2>
            </div>
            <div className="flex items-center gap-3.5">
              {productList.length > 5 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentProductPage <= 0}
                    onClick={() => setProductPage((prev) => Math.max(0, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Previous products"
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={currentProductPage >= totalProductPages - 1}
                    onClick={() => setProductPage((prev) => Math.min(totalProductPages - 1, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-900 hover:bg-emerald-50/60 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next products"
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              <Link
                className="group inline-flex items-center gap-1 text-sm font-bold text-emerald-900 transition-colors hover:text-emerald-600"
                to="/products"
              >
                <span>View all</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(visibleProducts.length > 0 ? visibleProducts : productList.slice(0, 5)).map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.category?.name,
                  price: product.price,
                  unit: product.unit,
                  images: product.images,
                  originalPrice: (product as any).originalPrice,
                  isOrganic: (product as any).isOrganic,
                  badge: (product as any).badge,
                  rating: (product as any).rating,
                  reviewCount: (product as any).reviewCount,
                }}
                onAddToCart={() => add.mutate({ productId: product.id, quantity: 1 })}
              />
            ))}
          </div>
        </Reveal>
      </section>
    </MainLayout>
  );
}
