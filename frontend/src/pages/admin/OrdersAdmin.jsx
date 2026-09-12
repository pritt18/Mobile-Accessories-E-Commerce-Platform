import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  CheckCircle,
  Truck,
  Eye,
  Filter,
  ExternalLink,
  Printer,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Manage Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const handleOpenManage = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCourierName(order.courier_name || 'BlueDart Express');
    setTrackingId(order.tracking_id || '');
    setTrackingUrl(order.tracking_url || 'https://www.bluedart.com');
    setStatusNotes('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        courierName,
        trackingId,
        trackingUrl,
        notes: statusNotes,
      });
      if (res.data?.success) {
        setIsModalOpen(false);
        loadOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'PLACED', label: 'Placed' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Orders & Fulfillment</h1>
        <p className="text-xs text-gray-400 mt-1">Track customer orders, manage parcel status, and attach courier tracking info</p>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-[#11141d] rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === opt.value
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order # or Customer..."
            className="w-64 h-9 pl-9 pr-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Order No</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No orders found matching filter.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4 font-mono font-bold text-white">#{o.order_no}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-200">{o.user?.name || o.guest_name || 'Guest'}</div>
                      <div className="text-[11px] text-gray-500">{o.user?.email || o.guest_email}</div>
                    </td>
                    <td className="p-4 text-gray-400">{o.items?.length || 1} items</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {o.payment_method} ({o.payment_status})
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{formatCurrency(o.total)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${getStatusBadgeClass(o.status)}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-[11px]">{formatDateTime(o.placed_at)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenManage(o)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-brand-600 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Manage Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order Fulfillment #${selectedOrder.order_no}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            {/* Status Selector */}
            <div>
              <label className="block font-bold text-gray-300 mb-1">Update Status To:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold"
              >
                <option value="PLACED">PLACED (Order Received)</option>
                <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                <option value="PACKED">PACKED (Inspected & Boxed)</option>
                <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Courier Tracking fields (especially relevant when SHIPPED) */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <div className="font-bold text-brand-400 flex items-center space-x-1.5">
                <Truck size={15} />
                <span>Courier & Dispatch Information</span>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="BlueDart / Delhivery / DTDC"
                  className="w-full h-9 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">AWB Tracking Number</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BD-9821473210"
                  className="w-full h-9 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Courier Tracking URL</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 px-3 bg-gray-950 border border-gray-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Status Notes / Reason</label>
              <textarea
                rows={2}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Optional notes for customer tracking timeline..."
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              {updating ? 'Updating...' : 'Save Fulfillment Status'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
