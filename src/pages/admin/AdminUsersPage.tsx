import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from '@/features/admin/api/hooks';
import { AdminLayout } from '@/layouts/AdminLayout';
import type { User } from '@/types/api';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'customer' as User['role'],
  status: 'active' as User['status'],
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(-2)
    .toUpperCase();

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-emerald-950/5">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div>
                <div className="h-3.5 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-2.5 w-44 rounded bg-slate-100" />
              </div>
            </div>
          </td>
          <td><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
          <td><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
          <td><div className="h-3.5 w-24 rounded bg-slate-100" /></td>
          <td><div className="h-8 w-20 rounded bg-slate-100" /></td>
        </tr>
      ))}
    </>
  );
}

export function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'' | User['role']>('');
  const [status, setStatus] = useState<'' | User['status']>('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const users = useAdminUsers({
    page,
    perPage: 10,
    q: q || undefined,
    role: role || undefined,
    status: status || undefined,
  });

  const create = useCreateUser();
  const update = useUpdateUser();
  const remove = useDeleteUser();

  const rows = users.data?.data ?? [];
  const total = users.data?.meta.total ?? 0;
  const totalPages = Math.max(1, users.data?.meta.totalPages ?? 1);
  const from = total === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, total);

  const stats = useMemo(
    () => ({
      total,
      customers: rows.filter((item) => item.role === 'customer').length,
      admins: rows.filter((item) => item.role === 'admin').length,
      active: rows.filter((item) => item.status === 'active').length,
    }),
    [rows, total]
  );

  const openCreate = () => {
    setEditing(0);
    setForm(emptyForm);
  };

  const openEdit = (user: User) => {
    setEditing(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
    });
  };

  const save = () => {
    if (editing)
      update.mutate(
        {
          id: editing,
          fullName: form.fullName,
          phone: form.phone,
          role: form.role,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        },
        { onSuccess: () => setEditing(null) }
      );
    else
      create.mutate(form, {
        onSuccess: () => {
          setEditing(null);
          setForm(emptyForm);
        },
      });
  };

  const filter = <T extends string>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="max-w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <Users size={13} /> Permissions &amp; Accounts
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
              User Directory
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage registered customers, administrator roles, and account access permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* 4 Highlight Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Accounts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-950">{stats.total}</p>
            <p className="mt-1 text-xs text-slate-500">Registered member profiles</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customers</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <UserCheck size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-sky-700">{stats.customers}</p>
            <p className="mt-1 text-xs text-slate-500">Retail buyers &amp; clients</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrators</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Shield size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-amber-700">{stats.admins}</p>
            <p className="mt-1 text-xs text-slate-500">Privileged staff accounts</p>
          </div>

          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Status</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Check size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-700">{stats.active}</p>
            <p className="mt-1 text-xs text-slate-500">Normal account standing</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              placeholder="Search by full name, email..."
              className="w-80 rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
            />
          </label>

          <select
            value={role}
            onChange={(event) => filter(setRole, event.target.value as '' | User['role'])}
            className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm font-medium text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator (Admin)</option>
            <option value="customer">Customer (Customer)</option>
          </select>

          <select
            value={status}
            onChange={(event) => filter(setStatus, event.target.value as '' | User['status'])}
            className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm font-medium text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
          </select>
        </div>

        {/* Create/Edit Modal Box */}
        {editing !== null && (
          <div className="rounded-2xl border border-emerald-900/15 bg-white p-6 shadow-sm ring-1 ring-emerald-500/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-emerald-950">
                {editing === 0 ? 'Create New User' : 'Edit User Information'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                placeholder="Full Name *"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600 disabled:bg-slate-100"
                placeholder="Email Address *"
                type="email"
                value={form.email}
                disabled={editing !== 0}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                placeholder={editing === 0 ? 'Initial Password *' : 'New Password (leave empty to keep current)'}
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
              <select
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as User['role'] })}
              >
                <option value="customer">Customer (Customer)</option>
                <option value="admin">Administrator (Admin)</option>
              </select>
              <select
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as User['status'] })}
              >
                <option value="active">Active</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={create.isPending || update.isPending}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-emerald-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Email Verification</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.isLoading ? (
                  <SkeletonRows />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  rows.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            ) : (
                              initials(user.fullName)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-emerald-950">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                            user.role === 'admin'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'active' ? (
                          <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="flex w-fit items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.emailVerifiedAt ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <Check size={14} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                            <AlertTriangle size={14} /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            aria-label={`Edit ${user.fullName}`}
                            title="Edit user"
                            className="rounded-xl p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-900"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.confirm(`Delete user ${user.fullName}?`) &&
                              remove.mutate(user.id)
                            }
                            aria-label={`Delete ${user.fullName}`}
                            title="Delete user"
                            className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-950/8 px-6 py-4">
            <p className="text-xs font-semibold text-slate-500">
              Showing <strong>{from}</strong> to <strong>{to}</strong> of{' '}
              <strong>{total}</strong> users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-xl border border-emerald-950/15 p-2 text-slate-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1).map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setPage(item)}
                    className={`h-8 min-w-8 rounded-xl px-2.5 text-xs font-bold transition-all ${
                      page === item
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="rounded-xl border border-emerald-950/15 p-2 text-slate-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
