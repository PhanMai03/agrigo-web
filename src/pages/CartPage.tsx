import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/api/hooks';
import { useProductDetail } from '@/features/products/api/hooks';
import { productImage } from '@/lib/images';
import type { CartItem } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function CartItemThumbnail({ item }: { item: CartItem }) {
  // 1. Direct image from backend cart item (if backend supports or adds it)
  const directImage =
    item.imageUrl ||
    item.image ||
    item.thumbnail ||
    item.images?.find((img) => img.isPrimary)?.url ||
    item.images?.[0]?.url;

  // 2. Query product detail as fallback to fetch the real uploaded product images
  const { data: product, isLoading } = useProductDetail(
    directImage ? undefined : item.productId
  );

  const finalImage =
    directImage ||
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    productImage(item.productId);

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
      {isLoading && !directImage ? (
        <div className="h-full w-full animate-pulse bg-gray-200" />
      ) : (
        <img
          src={finalImage}
          alt={item.name}
          className="h-full w-full object-cover transition duration-200 hover:scale-105"
          onError={(event) => {
            (event.target as HTMLImageElement).src = productImage(item.productId);
          }}
        />
      )}
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const clear = useClearCart();

  const [selected, setSelected] = useState<number[]>([]);
  const items = cart.data?.items ?? [];
  const allSelected = items.length > 0 && selected.length === items.length;

  const selectedTotal = useMemo(
    () =>
      items
        .filter((item) => selected.includes(item.productId))
        .reduce((sum, item) => sum + item.subtotal, 0),
    [items, selected]
  );

  const toggleAll = () =>
    setSelected(allSelected ? [] : items.map((item) => item.productId));

  if (cart.isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center text-gray-500 sm:px-6 lg:px-8">
          Loading cart...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-xs text-gray-400">
          <Link className="hover:text-green-700" to="/">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-600">Cart</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          {/* Cart Table Container */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(240px,1fr)_100px_150px_100px_70px] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-bold text-gray-700 sm:grid">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {items.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="text-green-600" size={42} />
                <p className="mt-4 font-semibold text-gray-800">Your cart is empty</p>
                <Link
                  className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
                  to="/products"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 sm:grid-cols-[minmax(240px,1fr)_100px_150px_100px_70px] sm:gap-4 sm:px-6"
                  key={item.productId}
                >
                  {/* Product Details & Image */}
                  <div className="flex items-center gap-3">
                    <input
                      aria-label={`Select ${item.name}`}
                      checked={selected.includes(item.productId)}
                      className="h-4 w-4 accent-green-700"
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(item.productId)
                            ? current.filter((id) => id !== item.productId)
                            : [...current, item.productId]
                        )
                      }
                      type="checkbox"
                    />

                    <CartItemThumbnail item={item} />

                    <div className="min-w-0">
                      <Link
                        className="block truncate text-sm font-bold text-gray-900 hover:text-green-700"
                        to={`/products/${item.productId}`}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.unit} · {item.available ? `Stock ${item.stock}` : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <span className="text-sm font-semibold text-[#4D0E13]">
                    {currency.format(item.price)}
                  </span>

                  {/* Quantity Counter */}
                  <div className="flex w-fit items-center rounded-lg border border-gray-200">
                    <button
                      aria-label="Decrease quantity"
                      className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        update.mutate({
                          productId: item.productId,
                          quantity: item.quantity - 1,
                        })
                      }
                      type="button"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        update.mutate({
                          productId: item.productId,
                          quantity: item.quantity + 1,
                        })
                      }
                      type="button"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-bold text-[#4D0E13]">
                    {currency.format(item.subtotal)}
                  </span>

                  {/* Remove Button */}
                  <button
                    aria-label={`Remove ${item.name}`}
                    className="w-fit rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => remove.mutate(item.productId)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}

            {items.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs sm:px-6">
                <label className="flex items-center gap-2 font-semibold text-gray-700">
                  <input
                    checked={allSelected}
                    className="h-4 w-4 accent-green-700"
                    onChange={toggleAll}
                    type="checkbox"
                  />
                  <Check className="text-green-700" size={13} />
                  Select All
                </label>
                <button
                  className="flex items-center gap-1 font-semibold text-red-500 hover:text-red-700"
                  onClick={() => clear.mutate()}
                  type="button"
                >
                  <Trash2 size={14} />
                  Clear Cart
                </button>
                <strong className="ml-auto text-gray-800">
                  Total Item: {cart.data?.totalItems ?? 0}
                </strong>
              </div>
            )}
          </div>

          {/* Aside Order Summary */}
          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="text-xl font-extrabold text-gray-900">Order Summary</h2>

            <div className="mt-7 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({cart.data?.totalItems ?? 0} items)
                </span>
                <strong className="text-gray-900">
                  {currency.format(selected.length ? selectedTotal : cart.data?.subtotal ?? 0)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <strong className="text-gray-900">Free</strong>
              </div>
            </div>

            <div className="my-6 border-t border-gray-100" />

            <div className="flex justify-between text-base font-extrabold">
              <span>Total Amount</span>
              <span className="text-[#4D0E13]">
                {currency.format(selected.length ? selectedTotal : cart.data?.subtotal ?? 0)}
              </span>
            </div>

            <button
              className="mt-8 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!items.length}
              onClick={() => navigate('/checkout')}
              type="button"
            >
              Proceed to Checkout <span className="ml-1">›</span>
            </button>

            <Link
              className="mt-3 block w-full rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
              to="/products"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
}
