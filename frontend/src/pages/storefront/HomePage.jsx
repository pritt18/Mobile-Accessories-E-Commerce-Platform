import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Smartphone,
  Headphones,
  Cable,
} from 'lucide-react';
import api from '../../services/api';
import { ProductCard } from '../../components/storefront/ProductCard';

export const HomePage = () => {
  const [feed, setFeed] = useState({
    bestSellers: [],
    trending: [],
    newArrivals: [],
    categories: [],
  });
  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' | 'bestSellers' | 'newArrivals'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [feedRes, bannerRes] = await Promise.all([
          api.get('/products/home-feed'),
          api.get('/banners'),
        ]);

        if (feedRes.data?.success) {
          setFeed(feedRes.data.data);
        }
        if (bannerRes.data?.success) {
          setBanners(bannerRes.data.data || []);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Autoplay hero slider
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const heroBanners = banners.filter((b) => b.position === 'HERO');
  const activeHero = heroBanners[activeSlide] || {
    title: 'Precision Mobile Accessories, Engineered to Elevate',
    subtitle: 'Aviation-Grade MagSafe Cases, 65W GaN Chargers & Precision Accessories',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1600&auto=format&fit=crop&q=80',
    link: '/products',
  };

  const currentFeedProducts =
    activeTab === 'trending'
      ? feed.trending
      : activeTab === 'bestSellers'
      ? feed.bestSellers
      : feed.newArrivals;

  const logoCategoryIcons = [
    { label: 'CASES', icon: Smartphone, link: '/products?category=phone-cases' },
    { label: 'CHARGERS', icon: Zap, link: '/products?category=chargers' },
    { label: 'EARPHONES', icon: Headphones, link: '/products?category=audio' },
    { label: 'CABLES', icon: Cable, link: '/products?category=cables' },
    { label: 'SCREEN PROTECTORS', icon: Shield, link: '/products?category=screen-protectors' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Banner Slider */}
      <section className="relative overflow-hidden bg-slate-50/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-slate-950 shadow-xl min-h-[460px] flex items-center">
            {/* Background image with overlay gradient */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url(${activeHero.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-8 sm:p-14 max-w-2xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/40 text-cyan-300 text-xs font-black tracking-wide shadow-sm">
                <Sparkles size={14} />
                <span>MOBIXIA OFFICIAL DROP</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                {activeHero.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed">
                {activeHero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={activeHero.link || '/products'}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-extrabold rounded-xl flex items-center space-x-2.5 shadow-lg shadow-brand-500/25 transition hover:scale-105 active:scale-95"
                >
                  <span>Shop Accessories</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/products?category=chargers"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold rounded-xl transition backdrop-blur-sm"
                >
                  Explore GaN Fast Power
                </Link>
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            {heroBanners.length > 1 && (
              <div className="absolute right-6 bottom-6 flex space-x-2 z-20">
                <button
                  onClick={() =>
                    setActiveSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
                  }
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % heroBanners.length)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Brand Core Quick Bar (The 5 Core Icons from Mobixia Logo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/90 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {logoCategoryIcons.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  to={cat.link}
                  className={`p-3.5 rounded-xl bg-white hover:border-brand-500 border border-gray-200 hover:shadow-md transition group text-center flex flex-col items-center justify-center shadow-xs ${
                    idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition mb-1.5 shadow-xs">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-slate-700 group-hover:text-brand-600 uppercase">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Shop By Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-1">
              Engineered accessories for flagship devices
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {feed.categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 hover:border-brand-500 transition duration-300 aspect-[4/3] flex flex-col justify-end p-4 shadow-sm hover:shadow-xl"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative z-10">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition flex items-center justify-between">
                  <span>{cat.name}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-cyan-300" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Tabbed Product Showcase: Trending / Best Sellers / New */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curated Gear</h2>
            <p className="text-xs text-slate-500 mt-1">Tested for durability and ultra-fast performance</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'trending'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame size={14} />
              <span>Trending Now</span>
            </button>
            <button
              onClick={() => setActiveTab('bestSellers')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'bestSellers'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star size={14} />
              <span>Best Sellers</span>
            </button>
            <button
              onClick={() => setActiveTab('newArrivals')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'newArrivals'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={14} />
              <span>Hand-Picked</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentFeedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Dual Feature Banner Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-slate-900 p-8 sm:p-10 flex flex-col justify-between min-h-[260px] group shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />
            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/30 text-cyan-300 border border-brand-400/40 shadow-xs">
                GAN III CHARGING
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Power 3 Devices Simultaneously
              </h3>
              <p className="text-xs text-gray-300">
                65W GaN III technology packed in an ultra-portable wall adapter.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                to="/products?category=chargers"
                className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-300 hover:text-white transition"
              >
                <span>Discover GaN 65W</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-slate-900 p-8 sm:p-10 flex flex-col justify-between min-h-[260px] group shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />
            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/30 text-cyan-300 border border-brand-400/40 shadow-xs">
                MAGNETIC POWER
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Snap-On 10,000mAh Power Banks
              </h3>
              <p className="text-xs text-gray-300">
                Strong magnetic lock with integrated zinc kickstand for wireless viewing.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                to="/products?category=power-banks"
                className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-300 hover:text-white transition"
              >
                <span>View MagPower</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
