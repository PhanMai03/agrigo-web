import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ChevronRight, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { useCart } from '@/features/cart/api/hooks';
import { useCheckout } from '@/features/orders/api/hooks';
import { useProductDetail } from '@/features/products/api/hooks';
import { productImage } from '@/lib/images';
import type { CartItem } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const checkoutSchema = z.object({
  receiverName: z.string().min(1, 'Please enter receiver name'),
  phone: z.string().regex(/^[0-9+()\-\s]{8,20}$/, 'Invalid phone number format'),
  address: z.string().min(5, 'Delivery address must be at least 5 characters'),
  note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
  paymentMethod: z.enum(['cod', 'vnpay']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function CheckoutItemRow({ item }: { item: CartItem }) {
  const directImage =
    item.imageUrl ||
    item.image ||
    item.thumbnail ||
    item.images?.find((img) => img.isPrimary)?.url ||
    item.images?.[0]?.url;

  const { data: product } = useProductDetail(directImage ? undefined : item.productId);

  const finalImage =
    directImage ||
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    productImage(item.productId);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <img
        src={finalImage}
        alt={item.name}
        className="h-12 w-12 rounded-xl object-cover border border-gray-100 shrink-0"
        onError={(event) => {
          (event.target as HTMLImageElement).src = productImage(item.productId);
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
        <p className="text-[11px] text-gray-500">
          Qty: {item.quantity} {item.unit}
        </p>
      </div>
      <span className="text-xs font-bold text-[#4D0E13]">
        {currency.format(item.subtotal)}
      </span>
    </div>
  );
}

export function CheckoutPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cod',
    },
  });

  const items = cart.data?.items ?? [];
  const totalItems = cart.data?.totalItems ?? 0;
  const subtotal = cart.data?.subtotal ?? 0;

  const submit = (values: CheckoutFormValues) => {
    checkout.mutate(
      {
        paymentMethod: values.paymentMethod,
        shipping: {
          receiverName: values.receiverName,
          phone: values.phone,
          address: values.address,
        },
        note: values.note,
      },
      {
        onSuccess: (result) => {
          if (result.payment?.paymentUrl) {
            window.location.assign(result.payment.paymentUrl);
          } else {
            navigate(`/orders/${result.order.id}`);
          }
        },
      }
    );
  };

  if (cart.isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-gray-500">
          Loading checkout...
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-emerald-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add fresh agricultural produce to your cart before proceeding to checkout.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            Browse Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight size={12} />
          <Link to="/cart" className="hover:text-emerald-700">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold">Checkout</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900">Checkout &amp; Place Order</h1>

        <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]" onSubmit={handleSubmit(submit)}>
          {/* Shipping and Payment Form */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <Truck size={20} />
                <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Receiver's Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('receiverName')}
                    placeholder="e.g. Nguyễn Văn A"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.receiverName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.receiverName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="e.g. 0901234567"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    placeholder="Detailed house number, street, ward, district, city..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Order Note <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    {...register('note')}
                    rows={2}
                    placeholder="Special delivery instructions or packaging notes..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.note && (
                    <p className="mt-1 text-xs text-rose-600">{errors.note.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CreditCard size={20} />
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-emerald-50/40 transition">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="cod"
                    className="h-4 w-4 accent-emerald-700"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay cash in hand upon receipt of fresh produce</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-emerald-50/40 transition">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="vnpay"
                    className="h-4 w-4 accent-emerald-700"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">VNPay Online Payment</p>
                    <p className="text-xs text-gray-500">Pay securely via ATM Card, QR code, or Mobile Banking</p>
                  </div>
                </label>
              </div>

              {checkout.isError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
                  {checkout.error.message}
                </div>
              )}
            </div>
          </div>

          {/* Aside Order Summary & Item List */}
          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-extrabold text-gray-900">Order Summary</h2>
            <p className="mt-0.5 text-xs text-gray-500">Checking out {totalItems} items in your cart</p>

            {/* Order Items List */}
            <div className="mt-4 max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1">
              {items.map((item) => (
                <CheckoutItemRow key={item.productId} item={item} />
              ))}
            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <strong className="text-gray-900">{currency.format(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <strong className="text-emerald-700 font-bold">Free</strong>
              </div>
            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="flex justify-between text-base font-extrabold">
              <span>Total Amount</span>
              <span className="text-[#4D0E13]">{currency.format(subtotal)}</span>
            </div>

            <button
              className="mt-6 w-full rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
              disabled={checkout.isPending || !items.length}
              type="submit"
            >
              {checkout.isPending ? 'Processing Order...' : 'Place Order Now'}
            </button>

            <Link
              to="/cart"
              className="mt-3 block text-center text-xs font-semibold text-gray-500 hover:text-emerald-700"
            >
              ← Return to Cart to modify items
            </Link>
          </aside>
        </form>
      </section>
    </MainLayout>
  );
}
