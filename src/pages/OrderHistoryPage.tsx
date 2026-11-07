import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import {
  useCancelOrder,
  useOrders,
  useRetryVNPay,
} from '@/features/orders/api/hooks';
import { useProductDetail } from '@/features/products/api/hooks';
import { productImage } from '@/lib/images';
import type { OrderItem, OrderStatus } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const TABS: { label: string; value: '' | OrderStatus }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipping', value: 'shipping' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

function OrderItemThumbnail({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const { data: product } = useProductDetail(productId);
  const finalImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    productImage(productId);

  return (
    <img
      src={finalImage}
      alt={productName}
      className="h-16 w-16 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 object-cover shadow-2xs"
      onError={(event) => {
        (event.target as HTMLImageElement).src = productImage(productId);
      }}
    />
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
          <Clock size={13} className="text-amber-600" />
          Pending Approval
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
          <CheckCircle2 size={13} className="text-sky-600" />
          Confirmed
        </span>
      );
    case 'shipping':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
          <Truck size={13} className="text-indigo-600" />
          Delivering Produce
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
          <XCircle size={13} className="text-rose-600" />
          Cancelled
        </span>
      );
    default:
      return null;
  }
}

export function OrderHistoryPage() {
  const [selectedStatus, setSelectedStatus] = useState<'' | OrderStatus>('');
  const orders = useOrders({
    page: 1,
    perPage: 30,
    orderStatus: selectedStatus || undefined,
  });

  const cancel = useCancelOrder();
  const retry = useRetryVNPay();

  const list = orders.data?.data ?? [];

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-700">My Orders</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Order Management</h1>
            <p className="mt-1 text-xs text-gray-500">
              Track, review, and manage your agricultural produce orders
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            <ShoppingBag size={15} />
            Continue Shopping
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-gray-200 pb-3">
          {TABS.map((tab) => {
            const active = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                type="button"
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="mt-6 space-y-5">
          {orders.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-44 w-full animate-pulse rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <Package size={52} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
              <p className="mt-1 text-xs text-gray-400">
                {selectedStatus
                  ? `You have no orders currently in "${selectedStatus}" status.`
                  : "You haven't placed any orders with AgriGo yet."}
              </p>
              <Link
                to="/products"
                className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Browse Fresh Produce
              </Link>
            </div>
          ) : (
            list.map((order) => {
              const isUnpaidVNPay =
                order.paymentMethod === 'vnpay' &&
                order.paymentStatus === 'unpaid' &&
                order.orderStatus === 'pending';

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-black text-emerald-950">
                        {order.orderCode}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          <AlertCircle size={12} />
                          Unpaid ({order.paymentMethod.toUpperCase()})
                        </span>
                      )}
                      <OrderStatusBadge status={order.orderStatus} />
                    </div>
                  </div>

                  {/* Card Items */}
                  <div className="divide-y divide-gray-100 px-6">
                    {order.items.map((item: OrderItem) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 py-4"
                      >
                        <OrderItemThumbnail
                          productId={item.productId}
                          productName={item.productName}
                        />

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/products/${item.productId}`}
                            className="block truncate text-sm font-bold text-gray-900 hover:text-emerald-700 transition"
                          >
                            {item.productName}
                          </Link>
                          <p className="mt-1 text-xs text-gray-500">
                            Qty: <strong>{item.quantity} {item.unit}</strong> × {currency.format(item.price)}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-gray-900">
                          {currency.format(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Total ({order.items.length} items):</span>
                      <strong className="text-lg font-black text-[#4D0E13]">
                        {currency.format(order.totalPrice)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {isUnpaidVNPay && (
                        <button
                          onClick={() => retry.mutate(order.id)}
                          disabled={retry.isPending}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-50"
                          type="button"
                        >
                          <CreditCard size={14} />
                          {retry.isPending ? 'Redirecting...' : 'Pay with VNPay'}
                        </button>
                      )}

                      {order.orderStatus === 'pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel order ${order.orderCode}?`)) {
                              cancel.mutate({ id: order.id });
                            }
                          }}
                          disabled={cancel.isPending}
                          className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition disabled:opacity-50"
                          type="button"
                        >
                          Cancel Order
                        </button>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                      >
                        <span>Details</span>
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </MainLayout>
  );
}
