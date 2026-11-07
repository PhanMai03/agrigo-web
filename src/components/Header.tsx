import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { useLogout } from '@/features/auth/api/hooks';
import { useAuthStore } from '@/stores/authStore';
import brandMark from '@/assets/brand/agrigo-mark.png';

export type HeaderNavItem = { label: string; href: string };
export type HeaderProps = {
  cartCount?: number;
  navItems?: HeaderNavItem[];
  onLogin?: () => void;
  onSearch?: (query: string) => void;
};

const defaultNavItems: HeaderNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Checks if a hash link is one of the 3 allowed exceptions:
 * 1. About (/about#team, /#about, #about)
 * 2. Contact (/contact#form, /#contact, #contact)
 * 3. Products (/products#products, /#products, #products)
 */
function isAllowedHashHref(href: string): boolean {
  return /^(#|\/|\/about|\/contact|\/products)?#(about|contact|products|team|form|map-section)/i.test(href);
}

export function Header({
  cartCount = 0,
  navItems = defaultNavItems,
  onLogin,
  onSearch,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query.trim());
    navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  /**
   * Handle internal link clicks:
   * - Keeps hash for About, Contact, and Products sections.
   * - Converts non-allowed hashes (#projects, #experience, etc.) to clean URL paths
   *   or scrolls without pushing hash fragments to browser address bar.
   */
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      const rawId = href.replace(/^#\/?/, '').toLowerCase();
      if (!isAllowedHashHref(href)) {
        e.preventDefault();
        const el = document.getElementById(rawId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', window.location.pathname);
        } else {
          navigate(`/${rawId}`);
        }
      }
    }
  };

  const isItemActive = (href: string) => {
    if (href === '/') return location.pathname === '/' && !location.hash;
    if (href.startsWith('#')) return location.hash === href;
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-xl">
      <div className="w-full max-w-7xl mx-auto flex h-20 items-center gap-5 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link className="flex h-14 w-40 shrink-0 items-center" to="/" aria-label="AgriGo home">
          <img src={brandMark} alt="AgriGo" className="h-14 w-14 object-contain" />
          <span className="ml-1 text-2xl font-black tracking-[-0.05em] text-emerald-950">
            Agri<span className="text-emerald-600">Go</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 lg:gap-9 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative py-2 text-[15px] font-bold tracking-tight transition-colors ${
                  active ? 'text-emerald-800' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-1 w-6 rounded-full bg-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        <form className="ml-auto hidden w-full max-w-[290px] md:block" onSubmit={submitSearch}>
          <div className="flex h-11 items-center rounded-xl border border-emerald-900/15 bg-emerald-50/40 px-3.5 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
            <Search className="text-emerald-700 shrink-0" size={18} />
            <input
              aria-label="Search products"
              className="ml-2.5 min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-slate-400"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search produce..."
              value={query}
            />
          </div>
        </form>

        {/* Cart Icon */}
        <Link
          className="relative rounded-xl p-2.5 text-emerald-900 hover:bg-emerald-50 transition"
          to="/cart"
          aria-label={`Cart, ${cartCount} items`}
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white shadow-xs">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User Account Dropdown */}
        {user ? (
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-xl border border-emerald-900/15 bg-white py-2 pl-2 pr-3 text-sm font-bold text-slate-800 transition hover:border-emerald-600 hover:bg-emerald-50/50 shadow-2xs"
              type="button"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800 shrink-0">
                {user.fullName.trim().charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[130px] truncate">{user.fullName}</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-emerald-700' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-emerald-950/10 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-fadeIn">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="truncate text-xs font-black text-emerald-950">{user.fullName}</p>
                  <p className="truncate text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                  {user.role === 'admin' && (
                    <span className="mt-1.5 inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Administrator
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <UserRound size={16} className="text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <Package size={16} className="text-slate-400" />
                    <span>My Orders</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 transition"
                    >
                      <Shield size={16} className="text-amber-600" />
                      <span>Admin Management</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout.mutate();
                    }}
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut size={16} className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className="hidden rounded-xl border border-emerald-700 px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-700 hover:text-white sm:flex sm:items-center sm:gap-2 transition shadow-2xs"
            onClick={onLogin ?? (() => navigate('/login'))}
            type="button"
          >
            <UserRound size={17} />
            Login
          </button>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          aria-label="Open menu"
          className="rounded-xl p-2 text-emerald-900 hover:bg-emerald-50 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-emerald-900/10 bg-white px-5 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="text-base font-bold text-slate-700 hover:text-emerald-700"
                to={item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Signed in as <strong className="text-emerald-950">{user.fullName}</strong>
                </p>
                <Link
                  className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-emerald-700 py-1"
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound size={17} />
                  My Profile
                </Link>
                <Link
                  className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-emerald-700 py-1"
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                >
                  <Package size={17} />
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link
                    className="flex items-center gap-2.5 text-sm font-bold text-amber-800 hover:text-amber-900 py-1"
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Shield size={17} />
                    Admin Management
                  </Link>
                )}
                <button
                  className="flex items-center gap-2.5 text-sm font-bold text-rose-600 hover:text-rose-700 py-1 w-full text-left"
                  onClick={() => {
                    setMenuOpen(false);
                    logout.mutate();
                  }}
                  type="button"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="w-fit rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm mt-2"
                onClick={() => {
                  setMenuOpen(false);
                  if (onLogin) onLogin();
                  else navigate('/login');
                }}
                type="button"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
