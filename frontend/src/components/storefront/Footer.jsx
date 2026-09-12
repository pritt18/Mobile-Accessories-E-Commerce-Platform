import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
  Zap,
  Cable,
  Shield,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-gray-200 text-slate-600 mt-20">
      {/* Visual Category Icons Strip (Directly inspired by Mobixia logo footer icons) */}
      <div className="bg-slate-100/70 border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <Link
              to="/products?category=phone-cases"
              className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 hover:shadow-md transition group shadow-xs"
            >
              <Smartphone className="mx-auto text-slate-500 group-hover:text-brand-600 transition mb-1" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-600">
                Cases
              </span>
            </Link>

            <Link
              to="/products?category=chargers"
              className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 hover:shadow-md transition group shadow-xs"
            >
              <Zap className="mx-auto text-slate-500 group-hover:text-brand-600 transition mb-1" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-600">
                Chargers
              </span>
            </Link>

            <Link
              to="/products?category=audio"
              className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 hover:shadow-md transition group shadow-xs"
            >
              <Headphones className="mx-auto text-slate-500 group-hover:text-brand-600 transition mb-1" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-600">
                Earphones
              </span>
            </Link>

            <Link
              to="/products?category=cables"
              className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 hover:shadow-md transition group shadow-xs"
            >
              <Cable className="mx-auto text-slate-500 group-hover:text-brand-600 transition mb-1" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-600">
                Cables
              </span>
            </Link>

            <Link
              to="/products?category=screen-protectors"
              className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 hover:shadow-md transition group col-span-2 sm:col-span-1 shadow-xs"
            >
              <Shield className="mx-auto text-slate-500 group-hover:text-brand-600 transition mb-1" size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-600">
                Screen Protectors
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0 shadow-xs">
                <Truck size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Free Express Shipping</div>
                <div className="text-xs text-slate-500">On all prepaid orders over ₹499</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                <RotateCcw size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">7-Day Easy Returns</div>
                <div className="text-xs text-slate-500">Doorstep pickup & quick refunds</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 shadow-xs">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">100% Genuine Gear</div>
                <div className="text-xs text-slate-500">Official brand warranties included</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                <Headphones size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">24/7 Priority Support</div>
                <div className="text-xs text-slate-500">WhatsApp & phone desk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" />
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India's premier online destination for smartphone accessories, MagSafe charging systems, GaN chargers, premium earphones, and certified cables.
            </p>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <MapPin size={15} className="text-brand-600 shrink-0" />
                <span>Tech Hub, Bandra West, Mumbai, Maharashtra 400050</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={15} className="text-brand-600 shrink-0" />
                <span>support@mobixia.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={15} className="text-brand-600 shrink-0" />
                <span>+91 98765 43210 (Mon - Sat, 9am - 7pm)</span>
              </div>
            </div>

            {/* Quick Action Contact Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Support</span>
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Phone size={15} />
                <span>Call Desk</span>
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-4 text-brand-600">
              Categories
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products?category=phone-cases" className="text-slate-600 hover:text-brand-600 transition">
                  Phone Cases
                </Link>
              </li>
              <li>
                <Link to="/products?category=chargers" className="text-slate-600 hover:text-brand-600 transition">
                  GaN Fast Chargers
                </Link>
              </li>
              <li>
                <Link to="/products?category=cables" className="text-slate-600 hover:text-brand-600 transition">
                  High-Speed Cables
                </Link>
              </li>
              <li>
                <Link to="/products?category=audio" className="text-slate-600 hover:text-brand-600 transition">
                  Earphones & Wireless
                </Link>
              </li>
              <li>
                <Link to="/products?category=power-banks" className="text-slate-600 hover:text-brand-600 transition">
                  Magnetic Power Banks
                </Link>
              </li>
              <li>
                <Link to="/products?category=screen-protectors" className="text-slate-600 hover:text-brand-600 transition">
                  Screen Protectors
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-4 text-brand-600">
              Customer Service
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/account?tab=orders" className="text-slate-600 hover:text-brand-600 transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-brand-600 transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/page/shipping-policy" className="text-slate-600 hover:text-brand-600 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/page/refund-policy" className="text-slate-600 hover:text-brand-600 transition">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-slate-600 hover:text-brand-600 transition">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-4 text-brand-600">
              Mobixia
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/page/about-us" className="text-slate-600 hover:text-brand-600 transition">
                  About Mobixia
                </Link>
              </li>
              <li>
                <Link to="/page/privacy-policy" className="text-slate-600 hover:text-brand-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/page/terms-and-conditions" className="text-slate-600 hover:text-brand-600 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-2 font-mono">
                  GSTIN: 27AABCU9603R1ZM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-200 bg-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-600">
            © {new Date().getFullYear()} <strong className="text-slate-900">Mobixia Online India Pvt Ltd</strong>. All rights reserved.
          </div>
          <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
            <span>Payments Supported:</span>
            <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-slate-700 font-medium shadow-xs">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-slate-700 font-medium shadow-xs">Cards</span>
            <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-slate-700 font-medium shadow-xs">NetBanking</span>
            <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-slate-700 font-medium shadow-xs">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
