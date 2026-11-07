import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Filter,
  History,
  Package,
  Search,
} from 'lucide-react';
import { useInventoryHistory } from '@/features/admin/api/hooks';
import { AdminLayout } from '@/layouts/AdminLayout';

export function AdminInventoryPage() {
  const [productId, setProductId] = useState('');
  const [reason, setReason] = useState('');

  const data = useInventoryHistory({
    page: 1,
    perPage: 50,
    productId: productId ? Number(productId) : undefined,
    reason: (reason || undefined) as never,
  });

  const rows = data.data?.data ?? [];

  // Compute KPI metrics
  const stats = useMemo(() => {
    const totalTransactions = rows.length;
    const imports = rows.filter((r) => r.reason === 'import' || r.delta > 0).length;
    const orders = rows.filter((r) => r.reason === 'order_placed' || r.delta < 0).length;
    const adjustments = rows.filter((r) => r.reason === 'adjustment').length;
    return { totalTransactions, imports, orders, adjustments };
  }, [rows]);

  const getReasonBadge = (r: string) => {
    switch (r) {
      case 'import':
        return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">New Import</span>;
      case 'order_placed':
        return <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-800">Order Outflow</span>;
      case 'order_cancelled':
        return <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">Cancelled Return</span>;
      case 'adjustment':
        return <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-800">Stock Adjustment</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-700">{r}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <History size={13} /> Inventory Ledger &amp; Audit Trail
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
              Stock Movement Logs
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track warehouse inbound/outbound transactions, quantity adjustments, and historical audit records by product.
            </p>
          </div>
        </div>

        {/* 4 Highlight Metric Cards matching Client Design System */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Logs</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <BarChart3 size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-950">{stats.totalTransactions}</p>
            <p className="mt-1 text-xs text-slate-500">Recorded ledger entries</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Import Events</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-700">{stats.imports}</p>
            <p className="mt-1 text-xs text-slate-500">Restocked warehouse inventory</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sales Deductions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ArrowDownRight size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-amber-700">{stats.orders}</p>
            <p className="mt-1 text-xs text-slate-500">Fulfilled customer orders</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Adjustments</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Package size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-purple-700">{stats.adjustments}</p>
            <p className="mt-1 text-xs text-slate-500">Periodic audit reconciliations</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              className="w-72 rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
              min={1}
              placeholder="Search by Product ID..."
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </label>

          <label className="relative">
            <Filter size={15} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" />
            <select
              className="rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-9 pr-8 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">All Movement Reasons</option>
              <option value="import">Warehouse Inbound (Import)</option>
              <option value="order_placed">Order Outbound (Order Placed)</option>
              <option value="order_cancelled">Order Cancelled Return</option>
              <option value="adjustment">Stock Reconciliation (Adjustment)</option>
            </select>
          </label>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Quantity Change</th>
                  <th className="px-6 py-4">Stock After Change</th>
                  <th className="px-6 py-4">Reason Category</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.isLoading ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      Loading inventory ledger data...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      No inventory logs found matching the filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => (
                    <tr
                      className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                      key={item.id}
                    >
                      <td className="px-6 py-4 font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-900">
                          #{item.productId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-black ${
                            item.delta >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {item.delta > 0 ? (
                            <ArrowUpRight size={15} />
                          ) : (
                            <ArrowDownRight size={15} />
                          )}
                          {item.delta > 0 ? `+${item.delta}` : item.delta}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-950">
                        {item.quantityAfter}
                      </td>
                      <td className="px-6 py-4">{getReasonBadge(item.reason)}</td>
                      <td className="px-6 py-4 text-slate-500">{item.notes ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
