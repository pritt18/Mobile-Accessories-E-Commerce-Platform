import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Image, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const MarketingAdmin = () => {
  const [coupons, setCoupons] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(500);

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [link, setLink] = useState('/products');
  const [position, setPosition] = useState('HERO');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/admin/coupons'),
        api.get('/admin/banners'),
      ]);
      if (cRes.data?.success) setCoupons(cRes.data.data);
      if (bRes.data?.success) setBanners(bRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code,
        type,
        value: parseFloat(value),
        minOrderValue: parseFloat(minOrder),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      });
      setIsCouponModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/banners', {
        title,
        subtitle,
        image: bannerImg,
        link,
        position,
      });
      setIsBannerModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white">Promotions & Marketing</h1>
        <p className="text-xs text-gray-400 mt-1">Manage coupon discount codes and homepage hero/promo slider banners</p>
      </div>

      {/* 1. Coupons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Tag size={18} className="text-brand-400" />
            <span>Discount Coupons</span>
          </h2>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>New Coupon</span>
          </button>
        </div>

        <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-850/50 transition">
                  <td className="p-4 font-mono font-bold text-white">{c.code}</td>
                  <td className="p-4 text-gray-300">{c.type}</td>
                  <td className="p-4 font-bold text-brand-400">
                    {c.type === 'PERCENTAGE' ? `${c.value}%` : formatCurrency(c.value)}
                  </td>
                  <td className="p-4 text-gray-400">{formatCurrency(c.min_order_value)}</td>
                  <td className="p-4 text-gray-300 font-bold">{c.used_count}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Banners Section */}
      <div className="space-y-4 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Image size={18} className="text-cyan-400" />
            <span>Storefront Banners & Hero Slider</span>
          </h2>
          <button
            onClick={() => setIsBannerModalOpen(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>New Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#11141d] border border-gray-800 space-y-3 flex flex-col justify-between"
            >
              <div className="aspect-[21/9] rounded-xl overflow-hidden bg-gray-950 border border-gray-800 relative">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-black/80 text-white">
                  {b.position}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{b.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-1">{b.subtitle}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-xs">
                <span className="text-gray-500 font-mono text-[11px] truncate max-w-xs">{b.link}</span>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="text-gray-500 hover:text-rose-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Modal */}
      <Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title="Create New Coupon Code">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Coupon Code (e.g. FLASH25)</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CODE"
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Discount (?)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Value</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Min Order Amount (?)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Max Discount Cap (?)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition mt-2"
          >
            Create Promo Coupon
          </button>
        </form>
      </Modal>

      {/* Banner Modal */}
      <Modal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} title="Add Banner / Slider">
        <form onSubmit={handleCreateBanner} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Banner Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Banner headline..."
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Brief secondary copy..."
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={bannerImg}
              onChange={(e) => setBannerImg(e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              >
                <option value="HERO">Homepage Hero Slider</option>
                <option value="PROMO_TOP">Promotional Strip</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Target Link</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition mt-2"
          >
            Save Banner
          </button>
        </form>
      </Modal>
    </div>
  );
};
