import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardList,
  ExternalLink,
  FolderTree,
  LogOut,
  Menu,
  Package,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useLogout } from '@/features/auth/api/hooks';
import { useAuthStore } from '@/stores/authStore';
import brandMark from '@/assets/brand/agrigo-mark.png';

const links = [
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: BarChart3 },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/hero-showcase', label: 'Hero Showcase', icon: Sparkles },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentNav = links.find((link) => location.pathname.startsWith(link.to));
  const currentPageTitle = currentNav?.label ?? 'Dashboard';

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleLogout = () => logout.mutate(undefined, { onSuccess: () => navigate('/login') });

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1.5 px-3.5 py-6" aria-label="Admin navigation">
      <div className="mb-3 px-3 flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/70">
          Admin Workspace
        </p>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-white/20'
              : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={19}
                className={isActive ? 'text-white' : 'text-emerald-300/70 group-hover:text-emerald-300'}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-300" />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* Jump to Storefront Client */}
      <div className="pt-4">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-950/40 px-4 py-3 text-xs font-bold text-emerald-200 transition-all hover:border-emerald-400/40 hover:bg-emerald-900/40 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" />
            View Storefront
          </span>
          <ExternalLink size={14} className="opacity-70" />
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8faf8] flex text-slate-800">
      {/* Desktop Sidebar: Deep Forest Organic Theme (#10241b) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-emerald-950/30 bg-[#10241b] text-emerald-100">
        {/* Brand Header */}
        <div className="flex h-20 items-center border-b border-emerald-900/40 px-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={brandMark}
                alt="AgriGo"
                className="h-10 w-10 rounded-xl bg-white/95 object-contain p-1 shadow-md shadow-emerald-950/50 transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#10241b]">
                <Shield size={8} className="text-white" />
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">
                Agri<span className="text-emerald-400">Go</span>
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-400/90">
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        {renderNavLinks()}

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-emerald-900/40 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-800/30 bg-emerald-950/60 p-3 shadow-inner">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-md shadow-emerald-900/40">
              {(user?.fullName ?? 'Admin').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {user?.fullName ?? 'Administrator'}
              </p>
              <p className="text-[11px] font-semibold text-emerald-300/80">Agri-Go Platform</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-xl p-2 text-emerald-300/80 transition hover:bg-rose-500/20 hover:text-rose-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-emerald-950/40 bg-[#10241b] text-emerald-100 transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-emerald-900/40 px-5">
          <div className="flex items-center gap-3">
            <img src={brandMark} alt="AgriGo" className="h-10 w-10 rounded-xl bg-white object-contain p-1" />
            <div>
              <p className="text-xl font-extrabold text-white">Agri<span className="text-emerald-400">Go</span></p>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-emerald-200 hover:bg-emerald-900"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        {renderNavLinks()}
      </div>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Topbar: Glassmorphism surface matching client */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-emerald-950/10 bg-white/95 px-5 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-emerald-900 hover:bg-emerald-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">Dashboard</span>
              <span className="text-emerald-900/30">/</span>
              <span className="font-extrabold text-emerald-950">{currentPageTitle}</span>
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Calendar Date Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-emerald-900/10 bg-emerald-50/60 px-3.5 py-1.5 text-xs font-bold text-emerald-900">
              <Calendar size={14} className="text-emerald-700" />
              <span>{dateLabel}</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-emerald-900/10 bg-white p-2.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-500" />
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out of system"
              className="rounded-xl border border-emerald-900/10 bg-white p-2.5 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="p-5 sm:p-8 lg:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
