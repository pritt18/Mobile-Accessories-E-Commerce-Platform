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
  BatteryCharging,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, bannersRes] = await Promise.all([
          api.get('/products/home-feed'),
          api.get('/banners?position=HERO'),
        ]);
        if (feedRes.data?.success) setFeed(feedRes.data.data);
        if (bannersRes.data?.success) setBanners(bannersRes.data.data);
      } catch (err) {
        console.error('Home feed error:', err);
      }
    };
    fetchData();
  }, []);

  // Autoplay hero slider
  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const heroBanners = banners.filter((b) => b.position === 'HERO');
  const activeHero = heroBanners[activeSlide] || {
    title: 'Authentic Vortique Mobile Accessories',
    subtitle: 'German Silicone iPhone Cases, 65W GaN Chargers & MagSafe Accessories',
    image: 'https://vortique.in/images/20260909131205_1-1.JPG',
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
    { label: 'POWER BANKS', icon: BatteryCharging, link: '/products?category=power-banks' },
    { label: 'MOUNTS & STANDS', icon: Shield, link: '/products?category=stands-mounts' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Banner Slider (100% Full Screen Width) */}
      <section className="relative overflow-hidden bg-slate-950 w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] flex items-center border-b border-gray-800">
        {/* Full-width background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ backgroundImage: `url(${activeHero.image})` }}
        >
          {/* Deep immersive gradients for pristine contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        {/* Content aligned with container grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/40 text-cyan-300 text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-lg shadow-brand-500/10">
              <Sparkles size={14} className="animate-pulse text-cyan-400" />
              <span>MOBIXIA OFFICIAL DROP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
              {activeHero.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed max-w-xl drop-shadow">
              {activeHero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to={activeHero.link || '/products'}
                className="px-7 py-4 bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-sm font-extrabold rounded-xl flex items-center space-x-2.5 shadow-xl shadow-brand-500/30 transition hover:scale-105 active:scale-95 group"
              >
                <span>Shop Accessories</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?category=chargers"
                className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-bold rounded-xl transition backdrop-blur-md hover:border-white/40 active:scale-95"
              >
                Explore GaN Fast Power
              </Link>
            </div>
          </div>
        </div>

        {/* Left & Right Edge Navigation Arrows */}
        {heroBanners.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
              }
              aria-label="Previous Banner"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 hover:border-white/40 transition z-20 hover:scale-110 active:scale-90"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroBanners.length)}
              aria-label="Next Banner"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 hover:border-white/40 transition z-20 hover:scale-110 active:scale-90"
            >
              <ChevronRight size={22} />
            </button>

            {/* Bottom Slide Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20">
              {heroBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    activeSlide === idx
                      ? 'w-8 h-2.5 bg-gradient-to-r from-brand-400 to-cyan-400'
                      : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
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
