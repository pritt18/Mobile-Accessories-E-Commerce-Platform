import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const MyAccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Address modal form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Maharashtra');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadAccountData = async () => {
      try {
        const [ordersRes, addrRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/auth/addresses'),
        ]);
        if (ordersRes.data?.success) setOrders(ordersRes.data.data);
        if (addrRes.data?.success) setAddresses(addrRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAccountData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name, mobile, avatar });
      if (res.data?.success) {
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data?.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    }
  };

  const handleReorder = async (order) => {
    if (!order.items || order.items.length === 0) return;
    try {
      for (const item of order.items) {
        if (item.variant_id) {
          await addToCart(item.variant_id, item.qty || 1);
        }
      }
      navigate('/checkout');
    } catch (err) {
      alert('Could not add items to cart');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your Mobixia account? You will be logged out and your profile will be disabled.')) return;
    const res = await deleteAccount();
    if (res.success) {
      alert(res.message || 'Account deactivated.');
      navigate('/');
    } else {
      alert(res.message || 'Deactivation failed');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/auth/addresses/${editingAddressId}`, {
          name: addrName,
          phone: addrPhone,
          line1: addrLine1,
          line2: addrLine2,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          is_default: addrIsDefault,
        });
      } else {
        await api.post('/auth/addresses', {
          name: addrName,
          phone: addrPhone,
          line1: addrLine1,
          line2: addrLine2,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          is_default: addrIsDefault || addresses.length === 0,
        });
      }
      setShowAddressModal(false);
      const res = await api.get('/auth/addresses');
      if (res.data?.success) setAddresses(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.delete(`/auth/addresses/${id}`);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500 shadow-xs"
          />
          <div>
            <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email} • {user?.mobile || 'No phone added'}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-gray-300 text-xs font-bold transition shadow-xs"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Nav Tabs */}
        <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-1 shadow-xs">
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeTab === 'orders' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package size={16} />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'addresses' })}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeTab === 'addresses' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin size={16} />
            <span>Saved Addresses ({addresses.length})</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeTab === 'profile' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'security' })}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeTab === 'security' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock size={16} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-2">Order History</h2>
              {orders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-slate-500 shadow-xs">
                  You have not placed any orders yet.{' '}
                  <Link to="/products" className="text-brand-600 underline font-bold">Start Shopping</Link>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4 hover:border-gray-300 shadow-xs transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">#{o.order_no}</div>
                        <div className="text-[11px] text-slate-500">Placed on {formatDate(o.placed_at)}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeClass(o.status)}`}>
                          {o.status}
                        </span>
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(o.total)}</div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {o.items?.map((it) => (
                        <div key={it.id} className="flex items-center space-x-3 text-xs">
                          <img
                            src={it.image_snapshot || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=80&auto=format&fit=crop&q=80'}
                            alt={it.product_name_snapshot}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-slate-900 font-medium truncate">{it.product_name_snapshot?.replace(/NexGear/gi, 'Mobixia')}</div>
                            <div className="text-slate-500 text-[10px]">Qty: {it.qty} • {it.variant_snapshot}</div>
                          </div>
                          <div className="font-semibold text-slate-800">{formatCurrency(it.price * it.qty)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleReorder(o)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <RotateCcw size={13} />
                        <span>Reorder</span>
                      </button>
                      <Link
                        to={`/track/${o.order_no}?print=true`}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <FileText size={13} />
                        <span>Invoice (PDF)</span>
                      </Link>
                      <Link
                        to={`/track/${o.order_no}`}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900">Saved Delivery Addresses</h2>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddrName('');
                    setAddrPhone('');
                    setAddrLine1('');
                    setAddrLine2('');
                    setAddrCity('');
                    setAddrPincode('');
                    setShowAddressModal(true);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 relative text-xs shadow-xs">
                    {a.is_default && (
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        Default Address
                      </span>
                    )}
                    <div className="font-bold text-slate-900 text-sm">{a.name}</div>
                    <div className="text-slate-600">{a.line1}, {a.line2}</div>
                    <div className="text-slate-700">{a.city}, {a.state} - <strong>{a.pincode}</strong></div>
                    <div className="text-slate-500">Phone: {a.phone}</div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Delete Address"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Edit Profile Details</h2>
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium rounded-xl">
                  {profileSuccess}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full h-10 px-3 bg-slate-100 border border-gray-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo (Image URL)</label>
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="Avatar Preview"
                      className="w-10 h-10 rounded-full object-cover border border-gray-300 bg-slate-100 shrink-0"
                    />
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Save Profile Changes
                </button>
              </form>

              {/* Danger Zone: Account Deactivation / Deletion */}
              <div className="mt-8 pt-6 border-t border-rose-100">
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                      <AlertTriangle size={14} className="text-rose-600" />
                      <span>Account Deactivation / Deletion</span>
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Disable your account access and remove personal profile data from Mobixia.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              {passwordMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                }`}>
                  {passwordMsg.text}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title={editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={addrName}
              onChange={(e) => setAddrName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
            <input
              type="tel"
              required
              value={addrPhone}
              onChange={(e) => setAddrPhone(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Address Line 1</label>
            <input
              type="text"
              required
              value={addrLine1}
              onChange={(e) => setAddrLine1(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={addrLine2}
              onChange={(e) => setAddrLine2(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={addrPincode}
                onChange={(e) => setAddrPincode(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={addrIsDefault}
              onChange={(e) => setAddrIsDefault(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="font-semibold">Set as default delivery address</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition shadow-xs mt-2"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
};
