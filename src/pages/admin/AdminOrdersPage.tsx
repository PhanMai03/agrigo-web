import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  ClipboardList,
  Filter,
  Loader2,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  useAdminOrders,
  useMarkOrderRefunded,
  useProcessPaymentRefund,
  useRefundQueue,
  useUpdateOrderStatus,
} from '@/features/admin/api/hooks';
import { AdminLayout } from '@/layouts/AdminLayout';
import type { OrderStatus } from '@/types/api';

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'refunds'>('orders');
  const [status, setStatus] = useState<string>('');
  const [refundStatus, setRefundStatus] = useState<'pending' | 'refunded' | 'all'>('pending');

  // Orders Query
  const orders = useAdminOrders({
    page: 1,
    perPage: 50,
    orderStatus: (status || undefined) as OrderStatus | undefined,
  });

  // Refunds Query
  const refunds = useRefundQueue({
    page: 1,
    perPage: 50,
    status: refundStatus,
  });

  // Pending refunds count for badge
  const pendingRefundsQuery = useRefundQueue({ status: 'pending' });
  const pendingRefundsCount = pendingRefundsQuery.data?.meta?.total ?? 0;

  const update = useUpdateOrderStatus();
  const refund = useMarkOrderRefunded();
  const processRefund = useProcessPaymentRefund();

  const rows = orders.data?.data ?? [];
  const refundRows = refunds.data?.data ?? [];

  // Compute KPI metrics for Orders
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((o) => o.orderStatus === 'pending').length;
    const shipping = rows.filter((o) => o.orderStatus === 'shipping').length;
    const completed = rows.filter((o) => o.orderStatus === 'completed').length;
    return { total, pending, shipping, completed };
  }, [rows]);

  const getStatusBadge = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-800">
            <Truck size={12} /> In Transit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-800">
            <XCircle size={12} /> Cancelled
          </span>
        );
    }
  };

  const handleProcessRefund = (paymentId: number, txnRef: string, amount: number) => {
    if (
      window.confirm(
        `Confirm that payment #${paymentId} (${txnRef}) of ${currency.format(
          amount
        )} has been processed in VNPay merchant portal?`
      )
    ) {
      processRefund.mutate(paymentId);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title & Tab Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950">
              Orders &amp; Financial Ledger
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track customer order fulfilment, shipping milestones, and VNPay refund queues.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl border border-emerald-950/10 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'orders'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              <ClipboardList size={15} />
              <span>All Orders</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('refunds')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'refunds'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              <RotateCcw size={15} />
              <span>VNPay Refund Queue</span>
              {pendingRefundsCount > 0 && (
                <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {pendingRefundsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Orders Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Orders
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-emerald-950">{stats.total}</p>
                <p className="mt-1 text-xs text-slate-500">Total customer orders placed</p>
              </div>

              <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pending Review
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock size={18} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-amber-700">{stats.pending}</p>
                <p className="mt-1 text-xs text-slate-500">Requires prompt action</p>
              </div>

              <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    In Transit
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Truck size={18} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-purple-700">{stats.shipping}</p>
                <p className="mt-1 text-xs text-slate-500">Courier currently delivering</p>
              </div>

              <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Completed
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-emerald-700">{stats.completed}</p>
                <p className="mt-1 text-xs text-slate-500">Successfully delivered</p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative inline-flex items-center">
                <Filter size={15} className="pointer-events-none absolute left-3.5 text-slate-400" />
                <select
                  className="rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-9 pr-8 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipping">Shipping</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                  <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                    <tr>
                      <th className="px-6 py-4">Order Code</th>
                      <th className="px-6 py-4">Recipient Customer</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Payment Method &amp; Status</th>
                      <th className="px-6 py-4">Fulfillment Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.isLoading ? (
                      <tr>
                        <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                          Loading orders...
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                          No orders found matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      rows.map((order) => (
                        <tr
                          className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                          key={order.id}
                        >
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-emerald-950">
                              #{order.orderCode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{order.receiver.name}</p>
                            <p className="text-xs text-slate-500">{order.receiver.phone}</p>
                          </td>
                          <td className="px-6 py-4 font-black text-[#4D0E13]">
                            {currency.format(order.totalPrice)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.orderStatus)}
                              <select
                                className="rounded-xl border border-emerald-950/15 bg-white px-2.5 py-1 text-xs font-bold text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600"
                                value={order.orderStatus}
                                onChange={(e) =>
                                  update.mutate({
                                    id: order.id,
                                    status: e.target.value as OrderStatus,
                                  })
                                }
                              >
                                <option value="pending">pending</option>
                                <option value="confirmed">confirmed</option>
                                <option value="shipping">shipping</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {order.paymentStatus === 'refund_pending' && (
                                <button
                                  className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                                  aria-label={`Confirm refund for ${order.orderCode}`}
                                  title="Confirm refund"
                                  onClick={() => refund.mutate(order.id)}
                                  type="button"
                                >
                                  <CircleDollarSign size={14} />
                                  Refund
                                </button>
                              )}
                              <span
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"
                                title="Order recorded in system"
                              >
                                <CheckCircle2 size={16} />
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* VNPay Refund Queue Tab (GET /api/payments/refunds & POST /api/payments/:id/refunded) */
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status:
                </span>
                {(['pending', 'refunded', 'all'] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    type="button"
                    onClick={() => setRefundStatus(filterOpt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      refundStatus === filterOpt
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filterOpt}
                  </button>
                ))}
              </div>
            </div>

            {/* Refunds Table */}
            <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                  <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                    <tr>
                      <th className="px-6 py-4">Payment ID &amp; Txn Ref</th>
                      <th className="px-6 py-4">Order Code</th>
                      <th className="px-6 py-4">Refund Amount</th>
                      <th className="px-6 py-4">Bank / Provider</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.isLoading ? (
                      <tr>
                        <td className="px-6 py-12 text-center text-slate-500" colSpan={7}>
                          Loading refund queue...
                        </td>
                      </tr>
                    ) : refundRows.length === 0 ? (
                      <tr>
                        <td className="px-6 py-12 text-center text-slate-500" colSpan={7}>
                          No refund entries found matching status "{refundStatus}".
                        </td>
                      </tr>
                    ) : (
                      refundRows.map((item) => (
                        <tr
                          key={item.paymentId}
                          className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                        >
                          <td className="px-6 py-4">
                            <p className="font-extrabold text-emerald-950">
                              Payment #{item.paymentId}
                            </p>
                            <p className="font-mono text-xs text-slate-400">
                              Txn: {item.txnRef}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800">
                              #{item.order.orderCode}
                            </span>
                            <p className="text-xs text-slate-400">
                              Order Status: {item.order.orderStatus}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-black text-[#4D0E13]">
                            {currency.format(item.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              <Banknote size={13} />
                              {item.bankCode ?? 'VNPay Gateway'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            {item.refundReason ?? 'Cancelled order refund'}
                          </td>
                          <td className="px-6 py-4">
                            {item.refundStatus === 'pending' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                <Clock size={12} /> Pending Payout
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                <CheckCircle2 size={12} /> Paid Out
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.refundStatus === 'pending' ? (
                              <button
                                type="button"
                                disabled={processRefund.isPending}
                                onClick={() =>
                                  handleProcessRefund(
                                    item.paymentId,
                                    item.txnRef,
                                    item.amount
                                  )
                                }
                                className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-40"
                              >
                                {processRefund.isPending ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CircleDollarSign size={13} />
                                )}
                                <span>Confirm Payout</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">
                                {item.refundedAt
                                  ? `Completed ${new Date(item.refundedAt).toLocaleDateString()}`
                                  : 'Completed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
