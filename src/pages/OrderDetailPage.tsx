import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import {
  useCancelOrder,
  useOrderDetail,
  useRetryVNPay,
} from '@/features/orders/api/hooks';
import { useProductDetail } from '@/features/products/api/hooks';
import { productImage } from '@/lib/images';
import { ConfirmModal } from '@/components/ConfirmModal';
import type { OrderStatus } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function OrderDetailItemThumbnail({
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

export function OrderDetailPage() {
  const id = Number(useParams().id);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const order = useOrderDetail(Number.isFinite(id) ? id : undefined);
  const cancel = useCancelOrder();
  const retry = useRetryVNPay();

  if (order.isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-gray-500">
          Loading order details...
        </div>
      </MainLayout>
    );
  }

  if (!order.data) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="mt-2 text-xs text-gray-500">
            The requested order ID may not exist or belongs to another account.
          </p>
          <Link
            to="/orders"
            className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
          >
            Back to Orders
          </Link>
        </div>
      </MainLayout>
    );
  }

  const item = order.data;
  const isUnpaidVNPay =
    item.paymentMethod === 'vnpay' &&
    item.paymentStatus === 'unpaid' &&
    item.orderStatus === 'pending';

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-6"
          to="/orders"
        >
          <ChevronLeft size={16} />
          <span>Back to My Orders</span>
        </Link>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-emerald-950">
                Order {item.orderCode}
              </span>
              <OrderStatusBadge status={item.orderStatus} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={13} />
              Placed on {new Date(item.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isUnpaidVNPay && (
              <button
                onClick={() => retry.mutate(item.id)}
                disabled={retry.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-50"
                type="button"
              >
                <CreditCard size={15} />
                {retry.isPending ? 'Redirecting...' : 'Pay with VNPay'}
              </button>
            )}

            {item.orderStatus === 'pending' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancel.isPending}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                type="button"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Order Items Table */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-extrabold text-gray-900">
                Purchased Produce ({item.items.length} items)
              </h2>
            </div>

            <div className="divide-y divide-gray-100 px-6">
              {item.items.map((line) => (
                <div key={line.productId} className="flex items-center gap-4 py-4">
                  <OrderDetailItemThumbnail
                    productId={line.productId}
                    productName={line.productName}
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${line.productId}`}
                      className="block truncate text-sm font-bold text-gray-900 hover:text-emerald-700 transition"
                    >
                      {line.productName}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">
                      {line.quantity} {line.unit} × {currency.format(line.price)}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {currency.format(line.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <strong>{currency.format(item.subtotal)}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <strong className="text-emerald-700 font-bold">
                  {item.shippingFee === 0 ? 'Free' : currency.format(item.shippingFee)}
                </strong>
              </div>
              <div className="border-t border-gray-200/80 pt-3 flex justify-between text-base font-black">
                <span>Total Amount</span>
                <span className="text-lg text-[#4D0E13]">
                  {currency.format(item.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Aside Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Delivery Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <Truck size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Delivery Details
                </h3>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <User size={15} className="mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Receiver</p>
                    <p className="text-sm font-bold text-gray-900">{item.receiver.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-sm font-bold text-gray-900">{item.receiver.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Address</p>
                    <p className="text-sm font-semibold text-gray-900">{item.receiver.address}</p>
                  </div>
                </div>

                {item.note && (
                  <div className="mt-3 rounded-xl bg-amber-50/60 border border-amber-200/80 p-3">
                    <p className="text-[11px] font-bold text-amber-800 uppercase">Customer Note</p>
                    <p className="text-xs text-amber-950 mt-0.5">{item.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CreditCard size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Payment Status
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {item.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'VNPay Online'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Status</span>
                  {item.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      <AlertCircle size={12} /> Unpaid
                    </span>
                  )}
                </div>

                {item.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Paid Timestamp</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(item.paidAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Cancel Order Modal */}
        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={() => {
            cancel.mutate(
              { id: item.id },
              { onSettled: () => setShowCancelConfirm(false) }
            );
          }}
          title="Cancel This Order?"
          description={`Are you sure you want to cancel order ${item.orderCode}? The produce stock will be released.`}
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          variant="warning"
          isLoading={cancel.isPending}
        />
      </section>
    </MainLayout>
  );
}
