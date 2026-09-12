import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    site_tagline: '',
    support_email: '',
    support_phone: '',
    company_address: '',
    company_gstin: '',
    shipping_free_threshold: '499',
    shipping_standard_fee: '50',
    shipping_express_fee: '49',
    shipping_cod_fee: '0',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data?.success) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings({ ...settings, [key]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', { settings });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading site settings...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Store & Operational Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Configure business identity, GST details, and delivery fee thresholds</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <h2 className="text-base font-bold text-white">Store Identity & Legal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-400 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-400 mb-1">Company GSTIN Number</label>
              <input
                type="text"
                value={settings.company_gstin}
                onChange={(e) => handleChange('company_gstin', e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-400 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-400 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-400 mb-1">Registered Business Address</label>
              <input
                type="text"
                value={settings.company_address}
                onChange={(e) => handleChange('company_address', e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Controls */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Shipping & Delivery Fees Management</h2>
              <p className="text-xs text-gray-400 mt-0.5">Control customer shipping charges, express air surcharges, and free delivery qualifiers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <label className="block font-bold text-gray-300">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_free_threshold || '499'}
                onChange={(e) => handleChange('shipping_free_threshold', e.target.value)}
                className="w-full h-10 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white font-bold"
              />
              <span className="text-[10px] text-gray-500 block">Orders equal or above this get 100% free standard shipping.</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <label className="block font-bold text-gray-300">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_standard_fee || '50'}
                onChange={(e) => handleChange('shipping_standard_fee', e.target.value)}
                className="w-full h-10 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white font-bold"
              />
              <span className="text-[10px] text-gray-500 block">Applied when order subtotal is below the free threshold.</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <label className="block font-bold text-gray-300">Express Next-Day Air Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_express_fee || '49'}
                onChange={(e) => handleChange('shipping_express_fee', e.target.value)}
                className="w-full h-10 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white font-bold"
              />
              <span className="text-[10px] text-gray-500 block">Charged when customer selects Priority Air Next-Day delivery.</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <label className="block font-bold text-gray-300">COD Extra Handling Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_cod_fee || '0'}
                onChange={(e) => handleChange('shipping_cod_fee', e.target.value)}
                className="w-full h-10 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white font-bold"
              />
              <span className="text-[10px] text-gray-500 block">Optional surcharge for Cash on Delivery orders (₹0 for none).</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg"
        >
          <Save size={16} />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
};
