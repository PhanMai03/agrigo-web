import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Package, ShoppingBag, XCircle } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'unknown';
  const orderCode = params.get('orderCode') ?? '';

  const isSuccess = status === 'success';
  const isFailed = status === 'failed' || status === 'invalid';
  const isProcessing = status === 'processing';

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-12 text-center shadow-sm">
          {isSuccess && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Payment Successful!</h1>
              <p className="mt-2 text-base text-gray-600 font-medium">
                Cảm ơn bạn! Đơn hàng đã được thanh toán thành công qua cổng VNPay.
              </p>
              {orderCode && (
                <div className="mt-6 inline-block rounded-2xl bg-emerald-50/80 border border-emerald-200 px-6 py-3">
                  <p className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                    Order Reference Code
                  </p>
                  <p className="text-xl font-black font-mono text-emerald-950 mt-0.5">
                    {orderCode}
                  </p>
                </div>
              )}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  <Package size={18} />
                  View My Orders
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  <ShoppingBag size={18} />
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {isFailed && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-6">
                <XCircle size={48} />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Payment Cancelled / Failed</h1>
              <p className="mt-2 text-base text-gray-600">
                Giao dịch thanh toán qua VNPay không thành công hoặc bạn đã hủy thao tác thanh toán.
              </p>
              {orderCode && (
                <p className="mt-3 text-sm text-gray-500 font-mono">
                  Mã đơn hàng: <strong>{orderCode}</strong>
                </p>
              )}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  <Package size={18} />
                  Review Orders to Retry
                </Link>
                <Link
                  to="/cart"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Return to Cart
                </Link>
              </div>
            </>
          )}

          {isProcessing && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-6">
                <Clock size={48} />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Payment Processing</h1>
              <p className="mt-2 text-base text-gray-600">
                Hệ thống đang chờ phản hồi xác nhận từ cổng VNPay.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  to="/orders"
                  className="rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  View My Orders
                </Link>
              </div>
            </>
          )}

          {!isSuccess && !isFailed && !isProcessing && (
            <>
              <h1 className="text-2xl font-black text-gray-900">Payment Information</h1>
              <p className="mt-2 text-sm text-gray-600">
                Status: {status}
              </p>
              <div className="mt-6">
                <Link
                  to="/orders"
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  Check Order History
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

