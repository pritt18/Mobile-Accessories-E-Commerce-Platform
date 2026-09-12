import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Filter,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Check,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import { ProductCard } from '../../components/storefront/ProductCard';

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Current query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Load initial filter datasets
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await api.get('/categories');
        if (catRes.data?.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products on filter change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${query.toString()}`);
        if (res.data?.success) {
          setProducts(res.data.data);
          if (res.data.meta) {
            setPagination(res.data.meta);
          }
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const selectedCategoryObj = categories.find(
    (c) => c.slug === categoryParam || String(c.id) === categoryParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
            <Link to="/" className="hover:text-brand-600 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {searchParam
                ? `Search: "${searchParam}"`
                : selectedCategoryObj?.name || 'All Accessories'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {searchParam
              ? `Results for "${searchParam}"`
              : selectedCategoryObj?.name || 'All Mobile Gear'}
          </h1>
        </div>

        {/* Top Controls: Mobile Filter Button, Sort Selector, View Mode */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-2 hover:bg-slate-50 shadow-xs"
          >
            <Filter size={15} />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-slate-800 py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer shadow-xs"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Grid vs List View */}
          <div className="hidden sm:flex bg-slate-100 border border-gray-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal size={16} className="text-brand-600" />
              <span>Filters</span>
            </div>
            {(categoryParam || minPriceParam || maxPriceParam || inStockParam || searchParam) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-600 hover:underline flex items-center space-x-1 font-semibold"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left py-2 px-2.5 rounded-xl transition flex items-center justify-between ${
                  !categoryParam
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left py-2 px-2.5 rounded-xl transition flex items-center justify-between ${
                    categoryParam === c.slug
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  {c._count?.products !== undefined && (
                    <span className="text-[10px] text-slate-400 font-medium">{c._count.products}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Price (₹)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPriceParam}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <input
                type="number"
                value={maxPriceParam}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded bg-slate-50 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Listing Grid / List */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-2xl p-4 border border-gray-200 animate-pulse aspect-[3/4]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-gray-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-200/70 flex items-center justify-center mx-auto text-slate-500">
                <Filter size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching gear found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any products matching your specific combination of filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-10">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNo = i + 1;
                return (
                  <button
                    key={pageNo}
                    onClick={() => updateParam('page', String(pageNo))}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                      pagination.page === pageNo
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNo}
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between overflow-y-auto border-l border-gray-200 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-base font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </h4>
                <div className="space-y-1 text-xs">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateParam('category', c.slug);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-lg ${
                        categoryParam === c.slug ? 'bg-brand-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl mt-6 shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
