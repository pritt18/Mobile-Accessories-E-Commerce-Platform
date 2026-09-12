import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Logo } from '../common/Logo';
import api from '../../services/api';

export const Header = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useAuth();
  const { count: cartCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const searchRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.warn('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Autosuggest with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/products/autosuggest?q=${encodeURIComponent(searchQuery)}`);
        if (res.data?.success) {
          setSuggestions(res.data.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      {/* Top Ticker Notification with Mobixia royal blue gradient */}
      <div className="bg-gradient-to-r from-[#004bb5] via-[#0072ff] to-[#00c6ff] text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2 shadow-xs">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 shadow-xs">
          OFFER
        </span>
        <span>
          Free express delivery on orders over ₹499 • Use code{' '}
          <strong className="text-yellow-200 underline font-bold">FIRST10</strong> for 10% OFF
        </span>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobixia Brand Logo */}
        <Logo variant="light" />

        {/* Search Bar with Autosuggest */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-4 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.products.length || suggestions.categories.length) {
                  setShowSearchDropdown(true);
                }
              }}
              placeholder="Search phone cases, 65W GaN chargers, braided cables..."
              className="w-full h-11 pl-11 pr-4 bg-gray-100/90 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition shadow-inner"
            />
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          </form>

          {/* Autosuggest Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-12 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in divide-y divide-gray-100">
              {suggestions.categories.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-2 px-2">
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/products?category=${c.slug}`);
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-xs text-gray-700 rounded-lg transition border border-gray-200"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.products.length > 0 ? (
                <div className="p-2 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-2 px-2 pt-1">
                    Products
                  </div>
                  {suggestions.products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(`/product/${p.slug}`);
                      }}
                      className="flex items-center p-2 rounded-xl hover:bg-brand-50/60 cursor-pointer transition space-x-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate hover:text-brand-600">
                          {p.name}
                        </div>
                        <div className="text-xs font-bold text-brand-600">
                          ₹{p.price}{' '}
                          {p.mrp > p.price && (
                            <span className="text-gray-400 line-through font-normal ml-1">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  No products found for "{searchQuery}". Try searching for cases or chargers.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition"
            title="Wishlist"
          >
            <Heart size={22} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition group"
            title="Shopping Cart"
          >
            <ShoppingBag size={22} className="group-hover:scale-105 transition" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Menu */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition shadow-xs"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 top-12 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in divide-y divide-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5">
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isStaff && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition space-x-2"
                        >
                          <LayoutDashboard size={15} />
                          <span>Admin Back Office</span>
                        </Link>
                      )}

                      <Link
                        to="/account?tab=orders"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition space-x-2"
                      >
                        <Package size={15} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/account?tab=profile"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition space-x-2"
                      >
                        <User size={15} />
                        <span>Account Settings</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition space-x-2"
                      >
                        <Heart size={15} />
                        <span>My Wishlist</span>
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition space-x-2 text-left"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition hover:scale-105 active:scale-95"
              >
                <User size={16} />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-slate-50/90 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2">
          <Link
            to="/products"
            className="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-white transition flex items-center space-x-1"
          >
            <span>All Products</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="text-xs font-medium text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-white transition whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/products?isFeatured=true"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 transition"
          >
            ★ Best Sellers
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="w-4/5 max-w-sm h-full bg-white p-6 flex flex-col justify-between overflow-y-auto border-r border-gray-200 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <Logo variant="light" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile search */}
              <form onSubmit={handleSearchSubmit} className="mt-4 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Mobixia gear..."
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </form>

              <div className="mt-6 flex flex-col space-y-2">
                <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                  Product Catalog
                </div>
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-sm text-slate-700 hover:text-brand-600 font-medium"
                >
                  All Accessories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?category=${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-sm text-slate-700 hover:text-brand-600 font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-sm text-slate-800 font-medium"
                  >
                    My Account ({user.name})
                  </Link>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 text-sm text-amber-700 font-bold"
                    >
                      Admin Back Office
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2 text-sm text-rose-600 text-left font-medium"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-white font-bold text-sm shadow-md"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
